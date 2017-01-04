module.exports = {
  expectations: {
    url: 'http://example.com/',
    metrics: {
      ttfcp: {
        warn: '>=30',
        error: '>=5000'
      },
      ttfmp: {
        warn: '>=3000',
        error: '>=50'
      },
      psi: {
        warn: '>=1500',
        error: '>=32'
      }
    }
  }
}
