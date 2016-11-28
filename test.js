console.log('YES, RUNNING FROM VVV!', JSON.stringify(process.env))

var keygen = require('ssh-keygen');



if (!process.env.GH_DEPLOYMENT_KEY) {
  console.log('You need to set up your github deployment key!');
  keygen({
    comment: 'ci-deploy-key',
  }, function(err, out){
    if(err) {
      console.log('Something went wrong: '+err);
      return;
    }
    console.log('Keys created!');
    console.log('private key: '+out.key);
    console.log('public key: '+out.pubKey);
  });
}