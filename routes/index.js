var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res) {
  console.log(req);
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
  // console.dir(req.body);
  var hookData = req.body;
  var gitURL = hookData.repository.ssh_url;
  var RepoName = hookData.repository.name;
  var branch = hookData.pull_request.head.ref;
  var PRNum = hookData.pull_request.number;
  var dirName = RepoName + "_" + PRNum;
  if(hookData.action === 'open' || hookData.action === 'reopened') {
    console.log('Boot Docker');
    var execText = "";// "#!/bin/bash \n";
    execText += 'git clone ' + gitURL + ' ' +  RepoName + '_' + PRNum + '\n';
    execText += 'cd ' + RepoName + '_' + PRNum + '\n';
    execText += 'git checkout -t origin/' + branch + '\n';
    execText += 'cp ../DockerServer.sh . \n';
    execText += 'echo Setting Done!';
    var dockerCMD =
          'sudo docker run -d -t -p 2000:3000 -v /home/BLThunder/TOLK:/home/blthunder/'+ dirName +':rw blthunder/toms "/bin/bash /home/blthunder/pullreq_docker/'+ dirName +'/DockerServer.sh"';
    exec(execText,
         function(err, stdout, stderr){
           console.log(err);
           console.log(stdout);
           console.log(stderr);
           exec(dockerCMD,
                function(err, stdout, stderr){
                  console.log(err);
                  console.log(stdout);
                  console.log(stderr);
                });
         });
  }
  else {
    console.log('Remove Docker');
    exec('rm -fr ' + dirName,
        function(err, stdout, stderr){});
  }
  res.render('index', { title: 'Express' });
});

module.exports = router;
