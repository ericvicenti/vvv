
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
var buildPath = join(home, 'build');

var ghOrg = process.env.CIRCLE_PROJECT_USERNAME;
var ghRepo = process.env.CIRCLE_PROJECT_REPONAME;
var ghLink = 'https://github.com/'+ghOrg+'/'+ghRepo+'/settings/keys';
var circleLink = 'https://circleci.com/gh/'+ghOrg+'/'+ghRepo+'/edit#env-vars';
var repoPath = join(home, 'ghpages');
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
  fs.writeFileSync(keyPath, new Buffer(process.env.GH_DEPLOYMENT_KEY, 'hex'));
  console.log(fs.existsSync(sshConfigPath));
  console.log();
  var config = fs.readFileSync(sshConfigPath, 'utf-8');
  config = config + '\n\n' +
  'Host github.com-pages\n'+
  '  HostName github.com\n'+
  '  User git\n'+
  '  IdentityFile '+keyPath+'\n';
  fs.writeFileSync(sshConfigPath, config);
  console.log('wrote', config);


  fs.mkdirSync(buildPath);
  fs.writeFileSync(join(buildPath, 'index.html'), 'Hello, gh pages!');

  fs.mkdirSync(repoPath);
  var initOut = exec('git', [
    'init',
  ], {cwd: repoPath});
  console.log('init', initOut.stdout, initOut.stderr);

  var remoteOut = exec('git', [
    'remote',
    'add',
    '-t',
    'gh-pages',
    'origin',
    'github.com-pages:'+ghOrg+'/'+ghRepo+'.git'
  ], {cwd: repoPath});
  if (remoteOut.stderr.indexOf("pathspec 'gh-pages' did not match any file(s) known to git.") !== -1) {
    console.log('Remote branch does not already exist!');
    const remoteOut2 = exec('git', [
      'remote',
      'add',
      ''
    ], {cwd: repoPath});
    console.log('remoteOut2', remoteOut2.stdout, remoteOut2.stderr);
  } else {
    console.log('great news!', remoteOut.code === 0);
  }
  console.log('remote', remoteOut.stdout, remoteOut.stderr);

  var checkoutOut = exec('git', [
    'checkout',
    'gh-pages',
  ], {cwd: repoPath});
  console.log('checkout', checkoutOut.stdout, checkoutOut.stderr);

}