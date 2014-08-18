var React = require('react/addons')
  , cx = React.addons.classSet
  , dates = require('../util/dates')
  , chunk = require('../util/chunk')
  , directions = require('../util/constants').directions
  , transferProps = require('../util/transferProps')
  , _ = require('lodash')

var opposite = {
  LEFT:  directions.RIGHT,
  RIGHT: directions.LEFT
};


module.exports = React.createClass({

  displayName: 'CenturyView',

  mixins: [
    require('../mixins/PureRenderMixin'),
    require('../mixins/RtlChildContextMixin'),
    require('../mixins/DateFocusMixin')('century', 'decade')
  ],

  propTypes: {
    value:         React.PropTypes.instanceOf(Date),
    min:          React.PropTypes.instanceOf(Date),
    max:          React.PropTypes.instanceOf(Date),

    onChange:     React.PropTypes.func.isRequired
  },

  render: function(){
    var years = getCenturyDecades(this.props.value)
      , rows  = chunk(years, 4);

    return transferProps(
      _.omit(this.props, 'max', 'min', 'value', 'onChange'),
      <table tabIndex='0'
        ref='table' 
        role='grid' 
        className='rw-calendar-grid rw-nav-view'
        aria-labeledby={this.props['aria-labeledby']}
        onKeyUp={this._keyUp}>
        <tbody>
          { _.map(rows, this._row)}
        </tbody>
      </table>
    )
  },

  _row: function(row, i){

      
    return (
      <tr key={'row_' + i}>
      {_.map(row, date => {
        var focused  = fdates.eq(date,  this.state.focusedDate,  'decade')
          , selected = dates.eq(date, this.props.value,  'decade')
          , id = this.props.id && this.props.id + '_selected_item'
          , d = inRangeDate(date, this.props.min, this.props.max) 

        return !inRange(date, this.props.min, this.props.max) 
          ? <td className='rw-empty-cell'>&nbsp;</td>
          : (<td>
              <btn onClick={_.partial(this.props.onChange, d)} 
                tabIndex='-1'
                id={ focused ? id : undefined }
                aria-selected={selected}
                className={cx({ 
                  'rw-off-range':       !inCentury(date, this.props.value),
                  'rw-state-focus':     focused,
                  'rw-state-selected':  selected,
                 })}>
                { label(date) }
              </btn>
            </td>)
      })}
    </tr>)
  },

  focus: function(){
    this.refs.table.getDOMNode().focus();
  },

  move: function(date, direction){
    if ( this.isRtl() && opposite[direction])
      direction =  opposite[direction]

    if ( direction === directions.LEFT)
      date = dates.subtract(date, 1, 'decade')

    else if ( direction === directions.RIGHT)
      date = dates.add(date, 1, 'decade')

    else if ( direction === directions.UP)
      date = dates.subtract(date, 4, 'decade')

    else if ( direction === directions.DOWN)
      date = dates.add(date, 4, 'decade')

    return date
  }

});

function label(date){
  return dates.format(dates.startOf(date, 'decade'),    dates.formats.YEAR) 
    + ' - ' + dates.format(dates.endOf(date, 'decade'), dates.formats.YEAR)
}

function inRangeDate(decade, min, max){
  return dates.max( dates.min(decade, max), min) 
}

function inRange(decade, min, max){
  return dates.gte(decade, dates.startOf(min, 'decade'), 'year') 
      && dates.lte(decade, dates.endOf(max, 'decade'),  'year')
}

function inCentury(date, start){
  return dates.gte(date, dates.startOf(start, 'century'), 'year') 
      && dates.lte(date, dates.endOf(start, 'century'),  'year')
}

function getCenturyDecades(date){
  var date = dates.add(dates.startOf(date, 'century'), -20, 'year')

  return _.map(_.range(12), function(i){
    return date = dates.add(date, 10, 'year')
  })
}

var btn = require('../common/btn.jsx')