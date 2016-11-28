console.log('YES, RUNNING FROM VVV!', JSON.stringify(process.env))

var keygen = require('ssh-keygen');


var generalMessage = ''+
'You need to set up your github deployment key!' +
'';

var ghOrg = process.env.CIRCLE_PROJECT_ORGNAME;
var ghRepo = process.env.CIRCLE_PROJECT_REPONAME;
var ghLink = 'https://github.com/'+ghOrg+'/'+ghRepo+'/settings/keys';
var circleLink = 'https://circleci.com/gh/'+ghOrg+'/'+ghRepo+'/edit';

if (!process.env.GH_DEPLOYMENT_KEY) {
  keygen({
    comment: 'ci-deploy-key',
  }, function(err, out){
    if(err) {
      console.log(generalMessage);
      console.log('The key could not be automatically created: '+err);
      process.exit(0);
      return;
    }
    var priv = (new Buffer(out.key)).toString('hex');
    console.log(generalMessage);
    console.log('1. Go to '+ghLink)
    console.log('Add this public key: ')
    console.log(out.pubKey);
    console.log('2. Go to '+circleLink);
    console.log('Add an env variable called "GH_DEPLOYMENT_KEY": ');
    console.log(priv);

    process.exit(0);
  });
}

console.log('rock and roll!', process.env.GH_DEPLOYMENT_KEY);