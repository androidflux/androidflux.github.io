/**
 * @jsx React.DOM
 */

var React = require('React');
var Site = require('Site');
var Center = require('center');
var H2 = require('H2');

var support = React.createClass({
  render: function() {
    return (
      <Site section="support">

        <section className="content wrap documentationContent nosidebar">
          <div className="inner-content">
            <h2>Need help?!</h2>
            <div className="subHeader"></div>
            <p>
                有任何问题请联系:ntop.liu AT gmail.com, 另外我们的文档还不够完善，如果您在工作之余还有空闲时间欢迎加入我们，
                可以在<a href="https://github.com/androidflux/androidflux.github.io/issues">GithubIssue</a>领取任务。
                如何更新文档查看<a href="https://github.com/androidflux/androidflux.github.io/tree/master/engine">这里的说明</a>。    
            </p>
            </div>
        </section>

      </Site>
    );
  }
});

module.exports = support;
