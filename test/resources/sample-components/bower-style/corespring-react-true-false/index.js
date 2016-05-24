window['corespring-react-true-false'] = React.createClass({
  getInitialState: function () {
    return {};
  },
  componentDidMount: function () {},
  onChanged: function (e) {
    this.props.session.response = e.target.checked;
  },
  render: function () {

    this.props.session.otherReact = {
      msg: 'im a react message'
    };

    return React.createElement(
      'div',
      null,
      this.props.model.prompt,
      React.createElement('input', {
        type: 'checkbox',
        onChange: this.onChanged,
        disabled: this.props.mode.view == 'gather' ? '' : 'disabled',
        defaultChecked: this.props.session.response })
    );
  }
});
