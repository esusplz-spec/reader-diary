import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createReview, deleteReview, getReviews, type Review } from '../data/storage'
import bg from '../assets/page1.png'

function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setReviews(getReviews())
  }, [])

  const handleAddReview = () => {
    const newReview = createReview()
    navigate(`/review/${newReview.id}`)
  }

  const confirmDelete = () => {
    if (!deleteId) return
    deleteReview(deleteId)
    setReviews(getReviews())
    setDeleteId(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      {/* ЛИСТ */}
      <div
        style={{
          width: '800px',
          height: '1200px',
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* СКРОЛЛ ВНУТРИ ЛИСТА */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            padding: '40px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleAddReview}
            style={{
              background: 'rgba(94, 34, 34, 0.62)',
              marginLeft: 'auto',
              padding: '10px 24px',
              border: '1px solid #fff',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '24px',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            Добавить отзыв
          </button>
        </div>
          <h1 
          style={{
              background: 'rgba(94, 34, 34, 0.62)',
              marginBottom: '25px',
              padding: '16px 2px',
              border: '1px solid #fff',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '56px',
              fontFamily: 'Cormorant Garamond, serif',
            }}
            >Отзывы
            </h1>

          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '20px',
              backdropFilter: 'blur(8px)',
            }}
          >
            {reviews.length === 0 ? (
              <div style={{ opacity: 0.8 }}>Пока нет сохранённых отзывов</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <button
                      onClick={() => navigate(`/review/${review.id}`)}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#7B1113',
                        border: '1px solid rgba(247, 155, 155, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {review.title || 'Без названия'}
                    </button>

                    <button
                      onClick={() => setDeleteId(review.id)}
                      style={{
                        background: '#a33',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ПОПАП */}
      {deleteId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#B57281',
              padding: '44px',             // размер поп-апа
              borderRadius: '20px',       // скурление поп апа
              textAlign: 'center',       // выравнивание по 
              marginBottom: '360px',   // высота поп апа
              fontSize: '36px',       // размер текста
              fontWeight: '600',      // жирность
              color: '#7B1113',       // цвет
              letterSpacing: '1px',   // расстояние между буквами
              fontFamily: 'EB Garamond, serif',
            }}
          >
            <div style={{ marginBottom: '20px' }}>Удалить отзыв?</div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={confirmDelete}
                style={{
                  width: '100px',
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#7B1113',
                  color: '#fff',
                  fontSize: '24px',
                  fontFamily: 'Cormorant Garamond, serif',
                  cursor: 'pointer',
                }}
              >
                Да
              </button>

              <button
                onClick={() => setDeleteId(null)}
                style={{
                  width: '100px',
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: '1px solid #fff',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '24px',
                  fontFamily: 'Cormorant Garamond, serif',
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

export default HomePage
