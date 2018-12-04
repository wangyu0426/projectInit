module.exports = function (grunt) {
    grunt.registerTask('local', [
            'clean:prepare', 'copy:before', 'includeSource',
            'less:local', 'ngtemplates:local', 'rename:after', 'preprocess:local'
        ]);
    grunt.registerTask('dev', [
        'jshint','karma:unit','protractor:local'
    ]);
    grunt.registerTask('spectest', [
        'karma:unit'
    ]);
    grunt.registerTask('liveDeploy', [
        'clean:prepare', 'copy:before', 'includeSource', 'less:uat', 'ngtemplates:app', 'useminPrepare',
        'concat:generated', 'uglify:generated', 'filerev', 'usemin',
        'rename:after',  'copy:after',
        'clean:after',  'preprocess:live'
    ]);

    var path = {
        'root': './',
        'portal': 'portal/',
        'app': 'app/',
        'dist': 'dist/',
        'cshtml': 'Views/',
        'reporting': 'reporting/'
    };

    var root = path.root;
    var app = path.root + path.app;
    var app_dist = app + path.dist;
    var portal = path.root + path.portal;
    var portal_dist = portal + path.dist;
    var path_cshtml = root + path.cshtml + '**/*.cshtml';
    var reporting = root + path.reporting;

    var app_index = root + 'index.html';
    var signin = root + 'signin.html';
    var report = app + 'open/report.html';
    var portal_index = portal + 'index.html';

    var app_index_tpl = './index.tpl.html';
    var signin_tpl = './signin.tpl.html';
    var report_tpl = './app/open/report.tpl.html';
    var msg_cshtml_tpl = './Views/Shared/_MessageLayout.tpl.cshtml';
    var expiredInvite_html_tpl = './Views/ExpiredInvitation.tpl.html';
    var expiredPortalInvite_html_tpl = 'ß./Views/ExpiredPortalInvitation.tpl.html';

    var app_styles_css = app + 'content/css/styles.css';
    var app_styles_less = app + 'content/css/less/styles.less';
    var app_initial_css = app + 'content/css/initial.css';
    var app_initial_less = app + 'content/css/less/initial/initial.less';
    var portal_styles_css = portal + 'content/css/styles.css';
    var portal_styles_less = portal + 'content/css/less/styles.less';
    var reporting_styles_css = reporting + 'content/css/styles.css';
    var reporting_styles_less = reporting + 'content/css/less/styles.less';

    var app_gen_css = app + 'content/css/styles.*.css';
    var initial_gen_css = app + 'content/css/initial.*.css';
    var portal_gen_css = portal + 'content/css/styles.*.css';


    var version = grunt.file.readJSON('package.json').version;
    if (grunt.file.exists('version.txt')) {
        version = grunt.file.read('version.txt');
    }

    var banner = "/*!\n" +
        "  Veriface " + version + " (<%= grunt.template.today('yyyymmdd') %>)\n" +
        "  Copyright 2013-<%= grunt.template.today('yyyy') %>\n" +
        "*/" +
        "\n";

    grunt.initConfig({
        env: {
            options: {},
            local: {
                ENV: 'local'
            },
            uat: {
                ENV: 'uat'
            },
            live: {
                ENV: 'live'
            }
        },
        //usemin cannot natively handle .CSHTML files. So we make copies those files (*.tpl.cshtml)
        //with the extension .tpl.html and run usemin on those.
        //then afterwards we rename those specific files back to .cshtml

        clean: {
            prepare: [ app_dist, portal_dist, app_index, signin, report, portal_index, app_styles_css,
                app_initial_css, portal_styles_css, app_gen_css, portal_gen_css, initial_gen_css,
                './Views/Shared/_MessageLayout.cshtml', './Views/Shared/_PortalLayout.cshtml'],
            after: [
                './Views/Shared/_MessageLayout.tpl.html',
                './Views/Shared/_PortalLayout.tpl.html'
            ],
            'after_reporting_uat': [
            ],
            'before_reporting': [
            ]
        },
        copy: {
            before: {
                files: {
                    './Views/Shared/_MessageLayout.tpl.html': './Views/Shared/_MessageLayout.tpl.cshtml',
                    './Views/Shared/_PortalLayout.tpl.html':'./Views/Shared/_PortalLayout.tpl.cshtml'
                }

            },
            after: {
                files: {
                }
            }
        },
        rename: {
            after: {
                files: {
                    './Views/Shared/_MessageLayout.cshtml': './Views/Shared/_MessageLayout.html',
                    './Views/Shared/_PortalLayout.cshtml' : './Views/Shared/_PortalLayout.html'
                }

            }

        },
        includeSource: {
            options: {
                basePath: root
            },
            target: {
                files: {
                    './index.html': app_index_tpl,
                    './signin.html': signin_tpl,
                    './app/open/report.html': report_tpl,
                    './Views/ExpiredInvitation.html': expiredInvite_html_tpl,
                    './Views/ExpiredPortalInvitation.html': expiredPortalInvite_html_tpl,
                    './Views/Shared/_MessageLayout.html': './Views/Shared/_MessageLayout.tpl.html',
                    './Views/Shared/_PortalLayout.html':'./Views/Shared/_PortalLayout.tpl.html'

                }
            }
        },
        useminPrepare: {
            options: {
                dest: root,
                uglifyConcat: true
            },
            html: [app_index, signin, report, portal_index]
        },
        concat: {
            options: {
                banner: banner
            },
            generated:{
                options: {
                    sourceMap: false
                }
            }
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                banner: banner,
                sourceMap: false
            }
        },
        less: {
            local: {
                options: {
                    banner: banner,
                    sourceMap:false
                },
                files: {
                    './app/content/css/styles.css': app_styles_less,
                    './app/content/css/initial.css': app_initial_less
                }
            },
            uat: {
                options: {
                    cleancss: true,
                    banner: banner,
                    compress: true,
                    sourceMap:false
                },
                files: {
                    './app/content/css/styles.css': app_styles_less,
                    './app/content/css/initial.css': app_initial_less

                }
            },
            test: {
                files:{
                },
                options:{
                    compress: true
                }
            }
        },
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 20
            },
            js: {
                src: [app_dist + '**/*.js', portal_dist + '**/*.js']
            },
            css: {
                src: [app_styles_css, app_initial_css, portal_styles_css]
            }
        },
        usemin: {
            html: [app_index, signin, report, portal_index,
                './Views/Shared/_MessageLayout.html',
                './Views/ExpiredInvitation.html',
                './Views/ExpiredPortalInvitation.html',
                './Views/Shared/_PortalLayout.html'],
            options: {
                assetsDirs: [root]
            }
        },
        preprocess : {
            local: {
                src: app_index,
                options: {
                    inline: true,
                    context: {
                        //add variables here
                    }
                }
            },
            live: {
                src: app_index,
                options: {
                    inline: true,
                    context: {
                        //add variables here
                    }
                }
            },
            'reporting_uat':{
                options:{
                    context:{
                        NODE_ENV: 'uat'
                    }
                },
                src: reporting + 'index.src.html',
                dest: reporting + 'index.html',
            },
            'reporting_local':{
                options:{
                    context:{
                        NODE_ENV: 'local'
                    }
                },
                src: reporting + 'index.src.html',
                dest: reporting + 'index.html',
            }
        },
        watch:{
            'reporting_local':{
                files: reporting + 'index.src.html',
                tasks: ['preprocess:reporting_local'],
            }
        },
        jshint:{
            options: {
                '-W040': true, //Most for the line var vm = this;  If a strict mode function is executed using function invocation, its 'this' value will be undefined.
                '-W030': true, //If a strict mode function is executed using function invocation, its 'this' value will be undefined.
                '-W061': true, //eval can be harmful.
                '-W069': true, //['propertyName'] is better written in dot notation.
                '-W083': true, //Don't make functions within a loop.
                '-W014': true, //Misleading line break before '?'; readers may interpret this as an expression boundary.
                '-W033': true, //Missing semicolon  todo should fix this warning message
                '-W041': true //Use '===' to compare with ''  todo should fix this warning message
                //reporter: require('jshint-html-reporter'),
                //reporterOutput: 'jshint-report.html'
            },
            all: [ './app/**/*.js', '!./app/dist/**/*.js', '!./app/lib/**/*.js', '!./app/bootstrap.js', '!./app/login.js', '!./app/services/keyEvent.js']
        },
        ngtemplates:  {
            app: {
                cwd:      '.',
                src:      ['app/**/**.html'],
                dest:     './app/templates.js',
                options:{
                    prefix: '/',
                    htmlmin: {
                        removeComments: true,
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                    }
                }
            },
            local:{
                cwd:      '.',
                src:      ['app/404.html'],
                dest:     './app/templates.js',
                options:{
                    prefix: '/',
                    htmlmin: {
                        removeComments: true,
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                    }
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

}