import fs from 'fs';

// Apply refined URLs to grants.json
const grants = JSON.parse(fs.readFileSync('./src/data/grants.json', 'utf8'));

const refinedUrls = {
  'grant-halcyon-women': 'https://www.halcyonhouse.org/programs',
  'grant-bayer-empowerment': 'https://bayerfoundation-wea.com',
  'grant-westerwelle-young': 'https://westerwelle-foundation.com',
  'grant-mest-africa-challenge': 'https://meltwater.org/mest-africa-challenge/',
  'grant-catalyst-fund': 'https://bfacatalystfund.com/',
  'grant-fsd-africa': 'https://www.fsdafrica.org/',
  'grant-anzisha-prize': 'https://anzishaprize.org/apply/',
  'grant-chainlink-community': 'https://chain.link/community/grants',
  'grant-gitcoin-grants': 'https://grants.gitcoin.co/',
  'grant-filecoin-foundation': 'https://fil.org/grants/',
  'grant-icp-developer': 'https://dfinity.org/grants',
  'grant-fearless-fund': 'https://www.fearless.fund/initiatives',
  'grant-sogal-black-founder': 'https://www.sogalfoundation.org/black-founder-startup-grant',
  'grant-stacy-rise': 'https://helloalice.com/funding/stacys-rise-project/',
  'grant-ifundwomen-universal': 'https://www.ifundwomen.com/apply-for-grants',
  'grant-boundless-empowher': 'https://boundlessfutures.org/our-grants/',
  'grant-mozilla-tech-fund': 'https://foundation.mozilla.org/en/what-we-fund/awards/mozilla-technology-fund/',
  'grant-usaid-div': 'https://www.usaid.gov/div'
};

grants.forEach(g => {
  if (refinedUrls[g.id]) {
    g.application_url = refinedUrls[g.id];
  }
});

fs.writeFileSync('./src/data/grants.json', JSON.stringify(grants, null, 2));
console.log('Saved refined URLs to src/data/grants.json');
