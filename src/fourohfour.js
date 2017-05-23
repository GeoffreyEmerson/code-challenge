const fourOhFour = (req, res, next) => {
  console.log('req', req)
  res.json({
    error: 'path unavailable',
    url: req.url,
    method: req.method
  })
}

module.exports = fourOhFour
