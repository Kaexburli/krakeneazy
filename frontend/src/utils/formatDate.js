const format = {
  D: {
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  },
  H: {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
}

const formatDate = (timestamp, patern) => {
  if (isNaN(timestamp)) return false

  let date = timestamp * 1000
  date = new Date(date)

  patern = typeof patern === 'undefined' ? 'D' : patern

  const formatter = new Intl.DateTimeFormat(navigator.language, format[patern])

  return formatter.format(date)
}

export default formatDate
