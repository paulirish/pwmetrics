module.exports = {
  url: 'http://example.com/',
  flags: {
    expectations: true,
    runs: 5,
  },
  expectations: {
    ttfmp: {
      warn: '>=3000',
      error: '>=5000',
    },
    tti: {
      warn: '>=5000',
      error: '>=15000',
    },
    ttfcp: {
      warn: '>=1500',
      error: '>=3000',
    },
    psi: {
      warn: '>=3000',
      error: '>=6000',
    },
    vc85: {
      warn: '>=3000',
      error: '>=5000',
    }
  },
}
