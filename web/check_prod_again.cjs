const https = require('https');

https.get('https://dais.iceebilisim.com/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-.*?\.js)"/);
    if (match) {
      console.log('JS URL:', match[1]);
      https.get('https://dais.iceebilisim.com' + match[1], (jsRes) => {
        let jsData = '';
        jsRes.on('data', chunk => jsData += chunk);
        jsRes.on('end', () => {
          console.log('Yardım / Destek found:', jsData.includes('Yardım / Destek'));
          console.log('SupportChat component found:', jsData.includes('SupportChat'));
          console.log('Has Profile found:', jsData.includes('hasProfile'));
        });
      });
    } else {
      console.log('JS file not found in HTML');
    }
  });
}).on('error', err => console.error(err));
