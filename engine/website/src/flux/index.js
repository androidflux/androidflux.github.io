/**
 * @jsx React.DOM
 */

var React = require('React');
var Site = require('Site');
var Prism = require('Prism');
var Marked = require('Marked');
var unindent = require('unindent');

var index = React.createClass({
  render: function() {
    return (
      <Site>
        <div className="hero">
          <div className="wrap">
            <div className="text"><strong>Android Flux</strong></div>
            <div className="minitext">
              当Android遇到了Flux，架构Android应用的新方式。
            </div>
          </div>
        </div>

        <section className="content wrap">
          <section className="home-section home-getting-started">
            <p>
            AndroidFlux是Facebook的<a href="https://facebook.github.io/flux/">Flux</a> 架构的Android实现。
            Flux是Facebook在14年提出的一种Web前端架构，这种架构可以很好的应用于Android平台，相对于其他的MVC/MVP/MVVM等模式，
            拥有良好的文档和更具体的设计，比较适合于快速开发实现。
            </p>
          </section>

          <section className="home-section home-getting-started">
            <iframe width="500" height="280" src="//www.youtube.com/embed/nYkdrAPrdcw?list=PLb0IAmt7-GS188xDYE-u1ShQmFFGbrk0v&amp;start=621" frameBorder="0" allowFullcreen></iframe>
          </section>

          <section className="home-bottom-section">
            <div className="buttons-unit">
              <a href="docs/overview.html#content" className="button">Learn more about Flux</a>
            </div>
          </section>
          <p></p>
        </section>
      </Site>
    );
  }
});

module.exports = index;
