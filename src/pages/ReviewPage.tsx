import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getReviewById, updateReviewTitle } from '../data/storage'

function ReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!id) return

    const review = getReviewById(id)

    if (!review) {
      navigate('/')
      return
    }

    setTitle(review.title)
  }, [id, navigate])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (id) {
      updateReviewTitle(id, value)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#222',
        color: '#fff',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            marginBottom: '20px',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          Назад
        </button>

        <h1 style={{ marginBottom: '20px' }}>Страница отзыва</h1>

        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Название книги"
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: 'none',
            outline: 'none',
            fontSize: '16px',
          }}
        />
      </div>
    </div>
  )
}

export default ReviewPage