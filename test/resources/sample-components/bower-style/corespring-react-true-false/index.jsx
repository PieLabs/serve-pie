window['react-true-false'] = React.createClass({
  getInitialState: function() {
    return {}
  },
  componentDidMount: function() {
  },
  onChanged: function(e){
    this.props.session.response = e.target.checked;
  },
  render: function() {

    this.props.session.otherReact = {
      msg: 'im a react message'
    }

    return <div>
      {this.props.model.prompt}
      <input
        type="checkbox"
        onChange={this.onChanged}
        disabled={this.props.mode.view !== 'gather' ? '' : 'disabled'}
        defaultChecked={this.props.session.response}></input>
    </div>;
  }
});
