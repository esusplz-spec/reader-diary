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
      width: '100%',
      height: '100vh',
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflowY: 'hidden',
      overflowX: 'hidden',
    }}
  >
    {/* ВНУТРЕННИЙ КОНТЕНТ СО СКРОЛЛОМ */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        padding: '40px 20px',
        boxSizing: 'border-box',
      }}
>
        {/* СКРОЛЛ ВНУТРИ ЛИСТА */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            padding: '40px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
              onClick={handleAddReview}
              style={{
              background: 'rgba(94, 34, 34, 0.62)',
              marginLeft: 'auto',
              marginBlockEnd: '40px',
              padding: '10px 24px',
              border: '1px solid #ffc7c7',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#f1cdcd',
              fontSize: '40px',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            Добавить отзыв
          </button>
        </div>
          <h1 
          style={{
              width: '85%',
              maxWidth: '1200px',
              background: 'rgba(94, 34, 34, 0.62)',
              color: 'rgb(255, 198, 198)',
              margin: '0 auto',
              marginBlockEnd: '40px',
              marginBottom: '30px',
              height: '100px',
              border: '1px solid #ffc7c7',
              textAlign: 'center', 
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '74px',
              fontFamily: 'Cormorant Garamond, serif',
            }}
            >Отзывы
            </h1>

          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              width: '100%',
              maxWidth: '1200px',
              margin: '20px auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              border: '1px solid #ffc7c7',
              borderRadius: '20px',
              backdropFilter: 'blur(8px)',
            }}
          >
            {reviews.length === 0 ? (
              <div 
              style={{ 
                opacity: 0.8, 
                textAlign: 'center',
                fontSize: '40px',
                fontFamily: 'Cormorant Garamond, serif',
                color: '#000000',
              }}
                >
                  Пока нет сохранённых отзывов
                  </div>
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
                        textShadow: '0 0 3px #9623239c',
                        border: '1px solid #ffc7c7',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        fontSize: '36px',
                        fontFamily: 'Cormorant Garamond, serif',
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
                        fontSize: '36px',
                        fontFamily: 'Cormorant Garamond, serif',
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
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#ffbaba6b',
              width: '420px',
              padding: '44px',             // размер поп-апа
              borderRadius: '20px',       // скурление поп апа
              border: '1px solid #ffc7c7',
              textAlign: 'center',       // выравнивание по 
              marginBottom: '360px',   // высота поп апа
              fontSize: '36px',       // размер текста
              fontWeight: '600',      // жирность
              color: '#7B1113',       // цвет
              letterSpacing: '1px',   // расстояние между буквами
              fontFamily: 'EB Garamond, serif',
            }}
          >
            <div 
            style={{ 
              marginBottom: '20px', 
              textShadow: '0 0 3px #5a2222',
              color: '#ffe5e5'
              }}
              >
                Удалить отзыв?
                </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={confirmDelete}
                style={{
                  width: '120px',
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#7B1113',
                  color: '#fff',
                  fontSize: '36px',
                  fontFamily: 'Cormorant Garamond, serif',
                  cursor: 'pointer',
                }}
              >
                Да
              </button>

              <button
                onClick={() => setDeleteId(null)}
                style={{
                  width: '120px',
                  padding: '10px 0px',
                  borderRadius: '8px',
                  border: '1px solid #fff',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '36px',
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