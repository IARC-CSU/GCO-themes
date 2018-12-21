# GCO-themes
Extracted HTML &amp; CSS files for the Global Cancer Observatory project

## Cancer Today theme
Files have been extracted from the project http://gco.iarc.fr/today/home with a simple angular (v1) structure. 
* Css code are inside sass/ folder (using Sass/Compass http://compass-style.org/) 
* index.html is the main layout of the project
* html files are inside templates/ folder

### Getting started
To start developing with this starter project
* install bower (https://bower.io/) for depedencies
```
bower install
```
* to start using css, install Compass and
```
compass watch
```
* to start using angular routes, use any server environment (apache or ws with npm)
```
ws -p 8002
```
### Notes
Only /home is working as of now. All routes are listed in js/app.js. 
```
.when( '/home' , {
  templateUrl	: 'templates/home.html', 
  reloadOnSearchVar : true
})
```
build your owns urls following this structure (ensure .html file exists). 

Warning: refreshing n webpage is only working with an Apache env + ModRewrite enable (see .htaccess file)

## Cancer Tomorrow theme
@todo
