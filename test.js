
var keygen = require('ssh-keygen');
var fs = require('fs-extra');
var exec = require('child_process').execFileSync;
var join = require('path').join;


var generalMessage = ''+
'You need to set up your github deployment key!' +
'';

var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var sshConfigPath = join(home, '.ssh/config');
var keyPath = join(home, 'access.key');

var ghOrg = process.env.CIRCLE_PROJECT_USERNAME;
var ghRepo = process.env.CIRCLE_PROJECT_REPONAME;
var ghLink = 'https://github.com/'+ghOrg+'/'+ghRepo+'/settings/keys';
var circleLink = 'https://circleci.com/gh/'+ghOrg+'/'+ghRepo+'/edit#env-vars';

if (!process.env.GH_DEPLOYMENT_KEY) {
  keygen({
    comment: 'ci-deploy-key',
  }, function(err, out){
    if(err) {
      console.log(generalMessage);
      console.log('The key could not be automatically created: '+err);
      process.exit(1);
      return;
    }
    var priv = (new Buffer(out.key)).toString('hex');
    console.log(generalMessage);
    console.log('');
    console.log('1. Go to '+ghLink);
    console.log('');
    console.log('Add this public key, and check the box to allow write access. You may call it "Circle-GHPages Deploy Key":');
    console.log(out.pubKey);
    console.log('2. Go to '+circleLink);
    console.log('');
    console.log('Add an env variable called "GH_DEPLOYMENT_KEY": ');
    console.log(priv);

    process.exit(1);
  });
} else {
  console.log('rock and roll!', process.env.GH_DEPLOYMENT_KEY);
  fs.writeFileSync(keyPath, new Buffer(process.env.GH_DEPLOYMENT_KEY, 'hex'));
  console.log(fs.existsSync(sshConfigPath));
  console.log(fs.readFileSync(join(home, '.ssh/config')));
  var cloneOut = exec('git', [
    'clone',
    '-b',
    'gh-pages',
    '-i ',
    keyPath,
    'git@github.com:'+ghOrg+'/'+ghRepo+'.git'
  ]);
  console.log(cloneOut.stdout, cloneOut.stderr);
}