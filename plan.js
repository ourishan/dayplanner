var w = '100%';
var h = '200%';
var fontsize = 24;
var iconsize = 24;
var defaultstart = 0;
var datastart = -1;
var defaultend = 2426;
var boxwidth = 280;
var boxmarginright = 4;
var timetxtbot = 4;
var dtfmt = "ll - ddd";
var picker;
var height = localStorage.getItem('height') || 2400

var svg = d3.select("#col2")
  .append("svg")
  .attr("height", height)
  .attr("viewBox", "0 0 1000 2426")
  .attr("preserveAspectRatio", "none meet");

function currstart() {
  var s = defaultstart;
  if (datastart > -1) {
    s = Math.min(s, datastart);
  }
  var day = getdt();
  var today = moment().format("YYYY-MM-DD");
  if (day === today) {
    s = Math.min(
      s,
      parseInt(moment().format("HH")) * 100
    );
  }
  return s;
}

function draw(items) {
  var offset = currstart();
  var times = d3.range(offset, defaultend + 1, 100);
  var timeSep = d3.range(offset, defaultend + 1, 100/12);
  var svgHeight = (defaultend - offset);
  var svgViewbox = "0 0 1000 " + svgHeight;

  svg = d3.select("#col2")
    .selectAll("svg")
    .remove();

  svg = d3.select("#col2")
    .append("svg")
    .attr("height", height)
    .attr("viewBox", svgViewbox)
    .attr("preserveAspectRatio", "none meet");

  svg.selectAll("rect")
    .remove();
  svg.selectAll("text")
    .remove();
  svg.selectAll("line")
    .remove();
  svg.selectAll("image")
    .remove();

  svg.selectAll("line .timesep")
    .data(times)
    .enter()
    .append("line")
    .attr("class", "timesep")
    .attr("x1", 4)
    .attr("x2", 996)
    .attr("y1", function (d) { return d - offset + fontsize; })
    .attr("y2", function (d) { return d - offset + fontsize; });

  svg.selectAll("line .timesep-light")
    .data(timeSep)
    .enter()
    .append("line")
    .attr("class", "timesep-light")
    .attr("x1", 4)
    .attr("x2", 996)
    .attr("y1", function (d) { return d - offset + fontsize; })
    .attr("y2", function (d) { return d - offset + fontsize; });

  svg.selectAll("text .time")
    .data(times)
    .enter()
    .append("text")
    .attr("class", "time")
    .attr("x", function (d) { return 4; })
    .attr("y", function (d) { return d - offset + fontsize - timetxtbot; })
    .text(function (d) { return pad(Math.floor(d / 100), 2) + ':00'; });

  svg.selectAll("rect")
    .data(items)
    .enter()
    .append("rect")
    .attr("class", "timeblock")
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("x", function (d) { return (d['col'] * (boxwidth + boxmarginright)) + 50; })
    .attr("y", function (d) { return d['y'] - offset + fontsize; })
    .attr("fill", function (d, i) { return tags2bg(d['tags']); })
    .attr("width", boxwidth + 'px')
    .attr("height", function (d) { return d['h']; })
    .append("title")
    .text(function (d) { return d['start'] + "-" + d['end'] + ' : ' + d['text']; });

  // svg.selectAll("image")
  //   .data(items.filter(function (d) { return tags2icon(d['tags']) !== "" && d['h'] > 32;} ))
  //   .enter()
  //   .append("image")
  //   .attr("x", function(d){ return ((d['col'] + 1) * (boxwidth + boxmarginright)); })
  //   .attr("y", function(d){ return d['y'] + d['h'] - offset - 8; })
  //   .attr("height", iconsize+"px")
  //   .attr("width", iconsize+"px")
  //   .attr("xlink:href", function(d){ return "/static/svg-icons/"+tags2icon(d['tags'])+".svg"; });

  svg.selectAll("text .itemtxt")
    .data(items)
    .enter()
    .append("text")
    .attr("x", function (d) { return (d['col'] * (boxwidth + boxmarginright)) + 60; })
    .attr("y", function (d) {
      var ts = txtsize(fontsize, d['h']);
      // TODO improve positioning below
      var tsfix = ts + Math.max(24 - ts, 0) + ((ts < fontsize) ? 4 : 0) + ((ts * 2 < d['h']) ? 8 : 0);
      return (d['y'] + d['h'] / 2 + tsfix) - offset;
    })
    .attr("font-size", function (d) {
      return txtsize(fontsize, d['h']) + "px";
    })
    .text(function (d) {
      var t = d['text'];
      if (t.length > 22) { t = t.slice(0, 22) + "..."; }
      return t;
    });

  mark_curr_time();
}

function tags2bg(tags) {
  var colors = {
    random: '#' + Math.floor(Math.random() * 16777215).toString(16),
    yellow: '#fffdc0',
    green: '#dcf6ac',
    green2: '#aaffa3',
    green3: '#b1eb47',
    purple: '#d7d0ff',
    orange: '#fdd7b2',
    gray: '#cccccc',
    red: '#ffcccc'
  };
  var colormap = {
    startup: 'orange',
    ritual: 'green',
    fun: 'purple',
    friends: 'purple',
    learn: 'yellow',
    book: 'red',
    consulting: 'green2',
    procrast: 'gray',
    default: 'random'
  };

  function autocolormap(t) {
    var n0 = "A".charCodeAt(0);
    var n = _.reduce(t, function (memo, item) { return (memo * 100) + (item.charCodeAt(0) - n0); }, 0);
    var cc = [
      "#A8DCC4", "#5C6BC0", "#57C3B9", "#CABC43", "#E29C53", "#AB47BC",
      "#29B6F6", "#66BB6A", "#FF7043", "#EF5350", "#7E88C1", "#26A69A",
      "#FFEEAA", "#FB8F99", "#C681D2", "#4FA5CC", "#87BF8A", "#FB8FDA",
      '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#A082C1',
      '#0099C6', '#DD4477', '#66AA00', '#D6A2A2', '#316395', '#994499',
      '#D6D48D', '#AAAA11', '#8863D2', '#E67300', '#B15656', '#329262',
      '#5574A6', '#5F61AB'
    ];
    return cc[n % cc.length];
  }

  var bg = false;
  _.each(tags, function (x) {
    x = tagalias(x);
    if (colormap[x]) {
      bg = colors[colormap[x]];
    } else {
      bg = autocolormap(x);
    }
  });
  return bg || colors[colormap['default']];
}

function tags2icon(tags) {
  var iconmap = {
    done: 'check-square-o',
    startup: 'line-chart',
    book: 'book',
    fun: 'smile-o',
    learn: 'bolt',
    ritual: 'battery-3',
    friends: 'group',
    consulting: 'dollar',
    procrast: 'exclamation-triangle'
  };
  var icon = "";
  _.each(tags, function (x) {
    x = tagalias(x);
    if (iconmap[x]) { icon = iconmap[x]; }
  });
  return icon;
}

function tagalias(tag) {
  var alias = {
    rt: 'ritual',
    fr: 'friends',
    st: 'startup',
    ln: 'learn',
    co: 'consulting',
    px: 'procrast',
    fn: 'fun',
    bk: 'book',
    dn: 'done'
  };
  return (typeof tag !== "string" || !(alias[tag])) ? tag : alias[tag];
}

function txtsize(fontsize, boxheight) {
  var s;
  boxheight = Math.floor(boxheight);
  if (boxheight > fontsize) {
    s = fontsize;
  } else {
    s = Math.max(14, boxheight - 2);
  }
  return s;
}

function c60to100(t) {
  // convert 60 min / hr to 100
  var min = t % 100;
  var hr = Math.floor(t / 100);
  return hr * 100 + (min / 60 * 100);
}

function inc_type60time_by_mins(t, min) {
  t = parseInt(t, 10);
  min = parseInt(min, 10);
  var h_inc = Math.floor(min / 60);
  var m_inc = min % 60;
  var h_t = Math.floor(t / 100);
  var m_t = t % 100;
  var m_result = m_t + m_inc;
  var h_result = h_t + h_inc + Math.floor(m_result / 60);
  m_result = m_result % 60;
  var result = h_result * 100 + m_result;
  return result;
}

function strip_comments(v) {
  var comment_1 = false;
  var comment_2 = false;
  var o = "";
  for (var i = 0; i < v.length; i++) {
    if (v[i] === "/" && v[i + 1] === "/") { comment_1 = true; }
    if (v[i] === "\n") { comment_1 = false; }
    if (v[i] === "/" && v[i + 1] === "*") { comment_2 = true; }
    if (v[i] === "*" && v[i + 1] === "/") { comment_2 = false; i += 1; continue; }
    if (!comment_1 && !comment_2) { o += v[i]; }
  }
  return o;
}

function test() {
  console.log('--- test begin ---');
  var cases = [
    ['1000,1100,foo', '1000', '1100'],
    ['1000,+30,foo', '1000', '1030'],
    ['1000,+90,foo', '1000', '1130'],
    ['1000,+100,foo', '1000', '1140'],
    ['1050,+30,foo', '1050', '1120'],
    ['1050,+90,foo', '1050', '1220'],
    ['1050,+100,foo', '1050', '1230'],
  ];
  var r;
  for (var i = 0; i < cases.length; i++) {
    r = parse(cases[i][0]);
    console.log('case', i);
    console.log(`${r[0].start} === ${cases[i][1]} :`, (r[0].start === cases[i][1]) ? 'ok' : 'failed <<<');
    console.log(`${r[0].end} === ${cases[i][2]} :`, (r[0].end === cases[i][2]) ? 'ok' : 'failed <<<');
  }
  console.log('--- test end ---');
}
// test();

function parse(v) {
  var op = [];
  v = strip_comments(v);
  var l = v.split('\n');
  var prev;
  datastart = -1;
  for (var i = 0; i < l.length; i++) {
    var ll = _.trim(l[i]);
    if (ll === "") { continue; }
    var lls = ll.split(',');
    if (lls.length >= 3) {
      var c = [lls.shift(), lls.shift(), lls.join(',')]; // split into 3 items
      if (c[0] === 'x') {
        c[0] = prev[1]; // use prev line's end time
      }

      var start = c60to100(c[0]);
      var end;
      if (c[1][0] === '+') {
        c[1] = '' + inc_type60time_by_mins(c[0], c[1]);
      }
      end = c60to100(parseInt(c[1]));

      if (start >= end) { continue; }
      var h = end - start - 1; // exclude ending minute
      var fulltext = c[2] || "";
      var tl = fulltext.split(' ');
      var tags = _.filter(tl, function (x) {
        return x.length > 1 && x[0] === "#";
      }).map(function (x) {
        return x.slice(1);
      });
      var text = _.trim(fulltext.split('#')[0]);
      if (datastart === -1 || datastart > start) { datastart = start; }
      op.push({
        h: h,
        col: 0,
        y: start,
        start: c[0], //as str
        end: c[1],
        text: text,
        tags: tags
      });
      prev = c;
    }
  }
  datastart = Math.floor(datastart / 100) * 100;

  // move box right on overlap
  for (var j = 1; j < op.length; j++) {
    var curr = op[j];
    for (var k = 0; k < j; k++) {
      var comp = op[k];
      if (is_overlapping(curr['y'], curr['y'] + curr['h'], comp['y'], comp['y'] + comp['h'])) {
        curr['col'] = comp['col'] + 1;
      }
    }
  }

  return op;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function is_overlapping(x1, x2, y1, y2) {
  return Math.max(x1, y1) <= Math.min(x2, y2);
}

function dt() {
  var stored_dt = localStorage.getItem('dt');
  var dt = ((stored_dt) ? moment(stored_dt, 'YYYY-MM-DD') : moment()).toDate();
  picker = new Pikaday({
    field: document.getElementById('datepicker'),
    format: dtfmt,
    defaultDate: dt,
    setDefaultDate: true,
    onSelect: function () {
      d3.select("#inp").property("placeholder", "start");
      localStorage.setItem('dt', moment(picker.toString(), dtfmt).format('YYYY-MM-DD'));
      read_data();
      read_data_local();
      var v = d3.select("#inp").property("value");
      var items = parse(v);
      draw(items);
    }
  });
}

function save_data_local(date, value) {
  localStorage.setItem(date, value)
}

function save_data(plan, date, user_id) {
  if (!user_id) {
    var user = firebase.auth().currentUser;
    if (!user) {
      return false;
    } else {
      user_id = user.uid;
      if (!user_id || user_id.length < 6) {
        console.log("Incorrect user id");
        return false;
      }
    }
  }
  date = date || getdt();
  if (!date) { return false; }
  plan = plan || "";
  firebase.database().ref('plans/' + user_id + '/' + date).set({
    plan: plan
  });
  return true;
}

function read_data_local() {
  var v = localStorage.getItem(picker.getDate()) || "";
  d3.select("#inp").property('value', v);
}

function read_data(date, user_id) {
  date = date || getdt();
  if (!date) { return false; }
  if (!user_id) {
    var user = firebase.auth().currentUser;
    if (!user) {
      return false;
    } else {
      user_id = user.uid;
      if (!user_id || user_id.length < 6) {
        console.log("Incorrect user id");
        return false;
      }
    }
  }
  firebase.database().ref('plans/' + user_id + '/' + date).once('value').then(
    function (data) {
      var plan = (data.val() && data.val().plan) || "";
      d3.select("#inp").property("value", plan);
      var items = parse(plan);
      draw(items);
    });

  return true;
}

function getdt() {
  var d = d3.select("#datepicker").node().value;
  if (d === "") { return false; }
  return moment(d, dtfmt).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD');
}

function changedate(x) {
  var dt = picker.getDate();
  if (x === 't') { dt = new Date(); }
  if (x === 'p' || x === 'n') {
    var delta = (x === 'p') ? -1 : 1;
    dt.setDate(dt.getDate() + delta);
  }
  picker.setDate(dt, false);
  $('#col2').scrollTop(0);
}

function mark_curr_time() {
  var offset = currstart();
  var dy = parseInt(moment().format("HH")) * 100 + Math.floor(parseInt(moment().format("mm")) / 60 * 100);
  var y = dy - offset + fontsize;
  var margin = 18;

  svg.selectAll("line.currtime").remove();
  svg.selectAll("line.currtime")
    .data([true])
    .enter()
    .append("line")
    .attr("class", "currtime")
    .attr("x1", 0 + margin * 3)
    .attr("x2", 996 - margin)
    .attr("y1", y)
    .attr("y2", y);
}

$(document).ready(function () {
  dt();
  read_data_local();

  var v = d3.select("#inp").property("value");
  var items = parse(v);
  draw(items);

  // update plan on new input
  d3.select("#inp").on("input", function () {
    var v = this.value;
    var items = parse(v);
    draw(items);
    save_data(v);
    save_data_local(picker.getDate(), v)
  });

  d3.select("#zoom").property('value', height)
  d3.select("#zoom").on("input", function () {
    height = this.value
    var v = d3.select("#inp").property("value");
    var items = parse(v);
    draw(items);
    localStorage.setItem('height', this.value)
  })

  d3.select("#dt-today").on("click", function () { changedate('t'); });
  d3.select("#dt-prev").on("click", function () { changedate('p'); });
  d3.select("#dt-next").on("click", function () { changedate('n'); });

  setInterval(mark_curr_time, 60 * 1000);

});
