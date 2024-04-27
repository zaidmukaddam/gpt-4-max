/** @type {import('next').NextConfig} */
module.exports = {
  async redirects() {
    return [
      {
        source: '/buy-license',
        destination: 'https://gpt4max.lemonsqueezy.com/buy/d0de682c-2f5e-4121-b813-7002a579ca3f',
        permanent: true
      }
    ]
  }
}
