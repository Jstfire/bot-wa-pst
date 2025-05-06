import axios from 'axios'

// Fungsi ambil preview
const getLinkPreview = async (url: string) => {
  try {
    const response = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
    const data = response.data
    if (data.status === 'success') {
      return {
        title: data.data.title,
        description: data.data.description,
        image: data.data.image?.url,
        url: data.data.url
      }
    }
    return null
  } catch (error) {
    console.error('Microlink error:', error.message)
    return null
  }
}
