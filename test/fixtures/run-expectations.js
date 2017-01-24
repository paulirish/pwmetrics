module.exports = {
  url: 'http://example.com/',
  expectations: {
    metrics: {
      ttfcp: {
        warn: '>=30',
        error: '>=500'
      },
      ttfmp: {
        warn: '>=300',
        error: '>=50'
      },
      psi: {
        warn: '>=150',
        error: '>=32'
      }
    }
  }
}
