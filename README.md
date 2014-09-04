# backyardProject

A [Sails](http://sailsjs.org) application. Tries to get all the techs I usually get from scratch for every projects.

# Done

- Include bower in grunt task
    - bootstrap less and jquery min with bower. Done on 'sails lift' with grunt. Cf tasks > bower.js and bower.json
- Jade templating
- Include bootstrap 3.0.0 in the default importer.less
- Sails 0.10
- include https://www.npmjs.org/package/sails-generate-auth to generate passport auth
- Passport Inclusion
- User system
- menu in a partial template for page style normal (not homepage)
- run policy on https://sails_0_10-c9-julienfroidefond.c9.io/chat. Try to access non logged and you'll see 403 by policy.
- set toc in config, consumate both in mainmenu and homepage. Jade : - var tocEntries = sails.config.toc.getTocEntries(req, res);. It construct a menu differently if you're home page and/or logged in.
- Resolve bug : if a view is called not by a controller passport doesn't work because no user in session ; we don't pass by the policy.
- MainController for pages globals. If or not accessible logged is action : hasToBeAuth or global.
- resolve asset problems : reordering in layout doesn't work. : Suppression of //scripts in layout.jade
- including file js front chat when needed only
- Chat app : cf https://github.com/balderdashy/sailsChat
- Chat app : list of connected user become only connected instead of all users
- Chat app : leave room on socket disconnect
- moving toc from config to service
- Testing generators

# TODO

- Study generator to do chatApp like a module (sails generate chatApp)
- CMS system
- Bad front end to change by an MVVM system on Chat app. (review the architecture)
- Test passport for the providers non local; but it requires key and I think it's working with no extra needs
- debug chat app : users count in rooms is wrong. In database it seems also wrong


# GIT

https://github.com/julienfroidefond/backyardProject

Rappels :
- git add .
- git commit -m 'MyComment'
- git push

# Cloud 9

- https://sails_0_10-c9-julienfroidefond.c9.io
- Run with backyardProject/app.js
- Run in a terminal grunt watch (app.js don't do it unlike sails lift)