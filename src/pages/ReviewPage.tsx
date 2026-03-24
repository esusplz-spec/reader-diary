import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteReview, getReviewById, updateReviewTitle } from '../data/storage'

type BookType = 'Бумажная' | 'Электронная' | 'Аудиокнига' | null

type SimilarBook = {
  id: string
  title: string
  author: string
  isEditing: boolean
  titleError: boolean
}

type ReviewDetails = {
  startDate: string
  endDate: string
  bookType: BookType
  author: string
  title: string
  genres: string[]
  ratings: {
    plot: number
    idea: number
    world: number
    characters: number
    relationships: number
    style: number
    ending: number
  }
  similarBooks: Array<{
    id: string
    title: string
    author: string
  }>
}

const GENRE_OPTIONS = ['а', 'б', 'в', '1', '2', '3']

const EMPTY_DETAILS: ReviewDetails = {
  startDate: '',
  endDate: '',
  bookType: null,
  author: '',
  title: '',
  genres: [],
  ratings: {
    plot: 0,
    idea: 0,
    world: 0,
    characters: 0,
    relationships: 0,
    style: 0,
    ending: 0,
  },
  similarBooks: [],
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const parts = []

  if (digits.length > 0) parts.push(digits.slice(0, 2))
  if (digits.length > 2) parts.push(digits.slice(2, 4))
  if (digits.length > 4) parts.push(digits.slice(4, 8))

  return parts.join(' / ')
}

function getDetailsStorageKey(id: string) {
  return `reader-diary-review-details-${id}`
}

function sanitizeForSave(
  details: ReviewDetails,
  similarBooks: SimilarBook[]
): ReviewDetails {
  return {
    ...details,
    author: details.author.trim(),
    title: details.title.trim(),
    similarBooks: similarBooks.map((item) => ({
      id: item.id,
      title: item.title.trim(),
      author: item.author.trim() || 'Неизвестно',
    })),
  }
}

function serializeState(details: ReviewDetails, similarBooks: SimilarBook[]) {
  return JSON.stringify(
    sanitizeForSave(details, similarBooks).similarBooks.length >= 0
      ? sanitizeForSave(details, similarBooks)
      : details
  )
}

function StarRating({
  label,
  value,
  isEdit,
  onChange,
}: {
  label: string
  value: number
  isEdit: boolean
  onChange: (value: number) => void
}) {
  const [hover, setHover] = useState(0)

  if (!isEdit && value === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '10px',
      }}
    >
      <div style={{ color: '#7B1113', fontSize: '18px' }}>{label}</div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {Array.from({ length: 10 }, (_, i) => {
          const star = i + 1
          const active = star <= (hover || value)

          return (
            <button
              key={star}
              type="button"
              onClick={() => isEdit && onChange(star)}
              onMouseEnter={() => isEdit && setHover(star)}
              onMouseLeave={() => isEdit && setHover(0)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: isEdit ? 'pointer' : 'default',
                fontSize: '24px',
                lineHeight: 1,
                padding: 0,
                color: active ? '#f6c945' : '#d8c6c6',
              }}
            >
              ★
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isEdit, setIsEdit] = useState(true)
  const [showLeavePopup, setShowLeavePopup] = useState(false)
  const [titleError, setTitleError] = useState(false)

  const [details, setDetails] = useState<ReviewDetails>(EMPTY_DETAILS)
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([])
  const [savedSnapshot, setSavedSnapshot] = useState('')
  const [hasSavedDetail, setHasSavedDetail] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/')
      return
    }

    const summary = getReviewById(id)

    if (!summary) {
      navigate('/')
      return
    }

    const storedRaw = localStorage.getItem(getDetailsStorageKey(id))

    if (storedRaw) {
      try {
        const stored = JSON.parse(storedRaw) as ReviewDetails

        setDetails(stored)
        setSimilarBooks(
          (stored.similarBooks || []).map((item) => ({
            ...item,
            isEditing: false,
            titleError: false,
          }))
        )
        setIsEdit(false)
        setHasSavedDetail(true)
        setSavedSnapshot(
          JSON.stringify({
            ...stored,
            similarBooks: stored.similarBooks || [],
          })
        )
        return
      } catch {
        // ignore parse error and treat as new
      }
    }

    setDetails({
      ...EMPTY_DETAILS,
      title: summary.title === 'Новый отзыв' ? '' : summary.title,
    })
    setSimilarBooks([])
    setIsEdit(true)
    setHasSavedDetail(false)
    setSavedSnapshot(
      JSON.stringify({
        ...EMPTY_DETAILS,
        title: summary.title === 'Новый отзыв' ? '' : summary.title,
        similarBooks: [],
      })
    )
  }, [id, navigate])

  const averageRating = useMemo(() => {
    const values = Object.values(details.ratings).filter((value) => value > 0)
    if (values.length === 0) return null

    const avg =
      values.reduce((sum, value) => sum + value, 0) / values.length

    return avg.toFixed(1)
  }, [details.ratings])

  const currentSnapshot = useMemo(() => {
    return serializeState(details, similarBooks)
  }, [details, similarBooks])

  const handleBack = () => {
    if (isEdit) {
      setShowLeavePopup(true)
      return
    }

    navigate('/')
  }

  const confirmLeaveWithoutSave = () => {
    if (!id) return

    if (!hasSavedDetail) {
      deleteReview(id)
      localStorage.removeItem(getDetailsStorageKey(id))
    }

    setShowLeavePopup(false)
    navigate('/')
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDetails((prev) => ({
      ...prev,
      [field]: formatDateInput(value),
    }))
  }

  const toggleBookType = (value: Exclude<BookType, null>) => {
    setDetails((prev) => ({
      ...prev,
      bookType: prev.bookType === value ? null : value,
    }))
  }

  const addGenre = (value: string) => {
    if (!value) return

    setDetails((prev) => ({
      ...prev,
      genres: [...prev.genres, value],
    }))
  }

  const removeGenre = (value: string) => {
    setDetails((prev) => ({
      ...prev,
      genres: prev.genres.filter((item) => item !== value),
    }))
  }

  const updateRating = (
    key:
      | 'plot'
      | 'idea'
      | 'world'
      | 'characters'
      | 'relationships'
      | 'style'
      | 'ending',
    value: number
  ) => {
    setDetails((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [key]: value,
      },
    }))
  }

  const addSimilarBook = () => {
    setSimilarBooks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: '',
        author: '',
        isEditing: true,
        titleError: false,
      },
    ])
  }

  const updateSimilarBook = (
    bookId: string,
    field: 'title' | 'author',
    value: string
  ) => {
    setSimilarBooks((prev) =>
      prev.map((item) =>
        item.id === bookId
          ? {
              ...item,
              [field]: value,
              titleError: field === 'title' ? false : item.titleError,
            }
          : item
      )
    )
  }

  const saveSimilarBookRow = (bookId: string) => {
    setSimilarBooks((prev) =>
      prev.map((item) => {
        if (item.id !== bookId) return item

        if (!item.title.trim()) {
          return {
            ...item,
            titleError: true,
          }
        }

        return {
          ...item,
          title: item.title.trim(),
          author: item.author.trim() || 'Неизвестно',
          isEditing: false,
          titleError: false,
        }
      })
    )
  }

  const editSimilarBookRow = (bookId: string) => {
    if (!isEdit) return

    setSimilarBooks((prev) =>
      prev.map((item) =>
        item.id === bookId
          ? {
              ...item,
              isEditing: true,
            }
          : item
      )
    )
  }

  const deleteSimilarBookRow = (bookId: string) => {
    setSimilarBooks((prev) => prev.filter((item) => item.id !== bookId))
  }

  const handleSave = () => {
    const normalizedTitle = details.title.trim()

    if (!normalizedTitle) {
      setTitleError(true)
      return
    }

    const hasInvalidSimilar = similarBooks.some(
      (item) => item.isEditing && !item.title.trim()
    )

    if (hasInvalidSimilar) {
      setSimilarBooks((prev) =>
        prev.map((item) =>
          item.isEditing && !item.title.trim()
            ? { ...item, titleError: true }
            : item
        )
      )
      return
    }

    const preparedSimilarBooks = similarBooks.map((item) => ({
      ...item,
      title: item.title.trim(),
      author: item.author.trim() || 'Неизвестно',
      isEditing: false,
      titleError: false,
    }))

    const finalDetails = sanitizeForSave(
      {
        ...details,
        title: normalizedTitle,
      },
      preparedSimilarBooks
    )

    if (!id) return

    localStorage.setItem(
      getDetailsStorageKey(id),
      JSON.stringify(finalDetails)
    )

    updateReviewTitle(id, normalizedTitle)

    setDetails(finalDetails)
    setSimilarBooks(
      preparedSimilarBooks.map((item) => ({
        ...item,
        isEditing: false,
        titleError: false,
      }))
    )
    setTitleError(false)
    setIsEdit(false)
    setHasSavedDetail(true)
    setSavedSnapshot(JSON.stringify(finalDetails))
  }

  const selectedGenreOptions = GENRE_OPTIONS.filter(
    (item) => !details.genres.includes(item)
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4d0d6',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.35)',
          borderRadius: '20px',
          padding: '24px',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: '#7B1113',
                color: '#fff',
              }}
            >
              Назад
            </button>

            {!isEdit && (
              <button
                type="button"
                onClick={() => setIsEdit(true)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: '#7B1113',
                  color: '#fff',
                }}
              >
                Редактировать
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '18px' }}>
          {/* Дата начала */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ color: '#7B1113', fontSize: '18px' }}>
              Дата начала чтения:
            </div>

            {isEdit ? (
              <input
                value={details.startDate}
                onChange={(e) =>
                  handleDateChange('startDate', e.target.value)
                }
                placeholder="__ / __ / ____"
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #d9a9af',
                }}
              />
            ) : (
              <div>{details.startDate || 'Неизвестно'}</div>
            )}
          </div>

          {/* Дата окончания */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ color: '#7B1113', fontSize: '18px' }}>
              Дата окончания чтения:
            </div>

            {isEdit ? (
              <input
                value={details.endDate}
                onChange={(e) =>
                  handleDateChange('endDate', e.target.value)
                }
                placeholder="__ / __ / ____"
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #d9a9af',
                }}
              />
            ) : (
              <div>{details.endDate || 'Неизвестно'}</div>
            )}
          </div>

          {/* Тип книги */}
          <div>
            {isEdit ? (
              <div
                style={{
                  display: 'flex',
                  gap: '18px',
                  flexWrap: 'wrap',
                }}
              >
                {(['Бумажная', 'Электронная', 'Аудиокнига'] as const).map(
                  (item) => (
                    <label
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        checked={details.bookType === item}
                        onClick={() => toggleBookType(item)}
                        readOnly
                      />
                      {item}
                    </label>
                  )
                )}
              </div>
            ) : (
              <div>{details.bookType || 'Неизвестно'}</div>
            )}
          </div>

          {/* Автор */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ color: '#7B1113', fontSize: '18px' }}>Автор:</div>

            {isEdit ? (
              <input
                value={details.author}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, author: e.target.value }))
                }
                placeholder="Ввод"
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #d9a9af',
                }}
              />
            ) : (
              <div>{details.author || 'Неизвестно'}</div>
            )}
          </div>

          {/* Название */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ color: '#7B1113', fontSize: '18px' }}>Название:</div>

            {isEdit ? (
              <input
                value={details.title}
                onChange={(e) => {
                  setDetails((prev) => ({ ...prev, title: e.target.value }))
                  setTitleError(false)
                }}
                placeholder="Ввод"
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: titleError ? '1px solid red' : '1px solid #d9a9af',
                }}
              />
            ) : (
              <div>{details.title}</div>
            )}
          </div>

          {/* Жанры */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <div style={{ color: '#7B1113', fontSize: '18px' }}>Жанры:</div>

            <div>
              {isEdit && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    addGenre(e.target.value)
                    e.currentTarget.value = ''
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #d9a9af',
                    marginBottom: '10px',
                  }}
                >
                  <option value="">Выбрать</option>
                  {selectedGenreOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}

              {details.genres.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {details.genres.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '999px',
                        background: 'rgba(123, 17, 19, 0.12)',
                        color: '#7B1113',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>{item}</span>
                      {isEdit && (
                        <button
                          type="button"
                          onClick={() => removeGenre(item)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#7B1113',
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !isEdit && <div>Неизвестно</div>
              )}
            </div>
          </div>

          {/* Оценка произведения */}
          <div>
            <div
              style={{
                color: '#7B1113',
                fontSize: '22px',
                marginBottom: '14px',
              }}
            >
              Оценка произведения
            </div>

            <StarRating
              label="Сюжет"
              value={details.ratings.plot}
              isEdit={isEdit}
              onChange={(value) => updateRating('plot', value)}
            />
            <StarRating
              label="Идея"
              value={details.ratings.idea}
              isEdit={isEdit}
              onChange={(value) => updateRating('idea', value)}
            />
            <StarRating
              label="Мир"
              value={details.ratings.world}
              isEdit={isEdit}
              onChange={(value) => updateRating('world', value)}
            />
            <StarRating
              label="Персонажи"
              value={details.ratings.characters}
              isEdit={isEdit}
              onChange={(value) => updateRating('characters', value)}
            />
            <StarRating
              label="Взаимоотношения"
              value={details.ratings.relationships}
              isEdit={isEdit}
              onChange={(value) => updateRating('relationships', value)}
            />
            <StarRating
              label="Слог"
              value={details.ratings.style}
              isEdit={isEdit}
              onChange={(value) => updateRating('style', value)}
            />
            <StarRating
              label="Концовка"
              value={details.ratings.ending}
              isEdit={isEdit}
              onChange={(value) => updateRating('ending', value)}
            />

            <div
              style={{
                marginTop: '14px',
                fontSize: '20px',
                color: '#7B1113',
              }}
            >
              Общая оценка:{' '}
              {averageRating ? `${averageRating} / 10 ★` : 'Неизвестно'}
            </div>
          </div>

          {/* Похожие книги */}
          {(isEdit || similarBooks.length > 0) && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ color: '#7B1113', fontSize: '22px' }}>
                  Похожие книги
                </div>

                {isEdit && (
                  <button
                    type="button"
                    onClick={addSimilarBook}
                    style={{
                      border: 'none',
                      background: '#7B1113',
                      color: '#fff',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '20px',
                    }}
                  >
                    +
                  </button>
                )}
              </div>

              {similarBooks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isEditing && editSimilarBookRow(item.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isEdit ? '1fr 1fr auto auto' : '1fr 1fr',
                    gap: '10px',
                    alignItems: 'center',
                    marginBottom: '10px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.25)',
                    cursor: !item.isEditing && isEdit ? 'pointer' : 'default',
                  }}
                >
                  {item.isEditing ? (
                    <>
                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateSimilarBook(item.id, 'title', e.target.value)
                        }
                        placeholder="Название"
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: item.titleError
                            ? '1px solid red'
                            : '1px solid #d9a9af',
                        }}
                      />
                      <input
                        value={item.author}
                        onChange={(e) =>
                          updateSimilarBook(item.id, 'author', e.target.value)
                        }
                        placeholder="Автор"
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #d9a9af',
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => saveSimilarBookRow(item.id)}
                        style={{
                          border: 'none',
                          background: '#7B1113',
                          color: '#fff',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        Сохранить
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSimilarBookRow(item.id)}
                        style={{
                          border: 'none',
                          background: '#b33',
                          color: '#fff',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑
                      </button>
                    </>
                  ) : (
                    <>
                      <div>{item.title}</div>
                      <div>{item.author || 'Неизвестно'}</div>

                      {isEdit && (
                        <button
                          type="button"
                          onClick={() => deleteSimilarBookRow(item.id)}
                          style={{
                            gridColumn: 'span 2',
                            justifySelf: 'end',
                            border: 'none',
                            background: '#b33',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            cursor: 'pointer',
                          }}
                        >
                          🗑
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}

              {!isEdit && similarBooks.length === 0 && null}
            </div>
          )}

          {/* Сохранить */}
          {isEdit && (
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: '#7B1113',
                  color: '#fff',
                  fontSize: '16px',
                }}
              >
                Сохранить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Поп-ап выхода без сохранения */}
      {showLeavePopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#f3c4cd',
              padding: '24px',
              borderRadius: '16px',
              minWidth: '320px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                marginBottom: '18px',
                color: '#7B1113',
                fontSize: '22px',
              }}
            >
              Вы точно хотите покинуть страницу?
              <br />
              Отзыв не будет сохранен
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={confirmLeaveWithoutSave}
                style={{
                  minWidth: '90px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#7B1113',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Да
              </button>

              <button
                type="button"
                onClick={() => setShowLeavePopup(false)}
                style={{
                  minWidth: '90px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #fff',
                  background: 'transparent',
                  color: '#7B1113',
                  cursor: 'pointer',
                }}
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}