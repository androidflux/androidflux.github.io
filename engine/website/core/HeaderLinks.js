/**
 * @providesModule HeaderLinks
 * @jsx React.DOM
 */

var HeaderLinks = React.createClass({
  links: [
    {section: 'docs', href: '/docs/overview.html#content', text: 'docs'},
    {section: 'support', href: '/support.html', text: 'support'},
    {section: 'github', href: 'https://github.com/androidflux/androidflux.github.io', text: 'github'},
  ],

  render: function() {
    return (
      <ul className="nav-site">
        {this.links.map(function(link) {
          return (
            <li key={link.section}>
              <a
                href={link.href}
                className={link.section === this.props.section ? 'active' : ''}>
                {link.text}
              </a>
            </li>
          );
        }, this)}
      </ul>
    );
  }
});

module.exports = HeaderLinks;
