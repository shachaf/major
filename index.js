"use strict";

//

function intersperse(x, a) {
  let res = [];
  for (let i = 0; ; i++) {
    res.push(a[i]);
    if (i == a.length) break;
    res.push(x);
  }
  return res;
}

//

function prefixMatches(majorDict, digits) {
  let options = [];
  for (let i = digits.length; i > 0; i--) {
    const prefix = digits.slice(0, i);
    const matches = majorDict.get(prefix);
    if (matches !== undefined) {
      options.push({"length": i, "words": matches});
    }
  }
  return options;
}

//

const e = React.createElement;

class DigitsInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {"digits": ""};
  }

  handleChange(event) {
    const value = event.target.value;
    if (value.match(/^[0-9]*$/)) {
      this.setState({"digits": value});
      this.props.digitsChanged(value);
    }
  }

  render() {
    return e("div", null,
      e("input", {"value": this.state.digits, "onChange": (e) => this.handleChange(e)}, null),
    );
  }
}

class Status extends React.Component {
  render() {
    const ws = this.props.wordState;
    let doneDigits = [];
    let words = [];
    let shownDigits = ws.digits.split("");
    for (const i in ws.path) {
      console.log(ws.path[i]);
      const wordDigits = shownDigits.splice(0, ws.path[i].length).join("");
      words.push(e("span", {key: i}, ws.path[i].word));
      doneDigits.push(e("span", {key: i}, wordDigits));
    }
    return e("div", {className: "status"},
      e("span", {className: "pathWords"}, intersperse(" ", words)),
      e("br", null, null),
      e("span", {className: "pathDigits"}, intersperse(" ", doneDigits)),
      e("span", {className: "remainingDigits"}, shownDigits.join("")),
      " ",
      ws.path.length > 0 ?
        e("a", {className: "popButton",
            onClick: this.props.popWord,
            href: "javascript:void(0);"},
          "\u21b5")
      : null,
    );
  }
}

class Word extends React.Component {
  onClick(e) {
    this.props.clicked();
    e.stopPropagation();
  }

  render() {
    return e("li", null,
      e("span", null,
        e("a", {"onClick": (e) => this.onClick(e), "href": "javascript:void(0)"}, this.props.word),
      ),
    );
  }
}

class Options extends React.Component {
  render() {
    const ws = this.props.wordState;
    if (ws.digits.length === 0) return e("div", null, "type some digits");
    if (ws.pathLen === ws.digits.length) return e("div", null, "all done!")
    if (this.props.options.length === 0) return e("div", null, "no options");
    let lengths = this.props.options.map(sub => {
      const words = sub.words.map(w => {
        return [e(Word,
          {"key": w, "word": w, "clicked": () => this.props.wordClicked(w, sub.length) }, null),
          " "
        ];
      });
      return e("li", {"key": sub.length},
        sub.length,
        e("ul", null, [].concat.apply([], words)),
      );
    });
    return e("div", {"className": "options"},
      e("ul", null, lengths)
    );
  }
}

class Major extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "unloaded",
      xhr: null,
      majorDict: null,
      wordState: {
        digits: "",
        path: [],
        pathLen: 0,
      }
    };
  }

  fetchData() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.status == 200) {
          this.gotData(xhr.responseText);
        } else {
          this.setState({"status": "error"});
        }
      }
    };
    xhr.open("GET", "majordict.json");
    xhr.send();
    return xhr;
  }

  gotData(data) {
    const majorDict = new Map(JSON.parse(data));
    this.setState({
      "status": "loaded",
      "xhr": null,
      "majorDict": majorDict,
    });
  }

  digitsChanged(digits) {
    this.setState({
      wordState: {
        digits: digits,
        path: [],
        pathLen: 0,
      },
    });
  }

  wordClicked(w, len) {
    const ws = this.state.wordState;
    this.setState({
      wordState: {
        digits: ws.digits,
        path: ws.path.concat({word: w, length: len}),
        pathLen: ws.pathLen + len,
      },
    });
  }

  popWord() {
    const ws = this.state.wordState;
    this.setState({
      wordState: {
        digits: ws.digits,
        path: ws.path.slice(0, -1),
        pathLen: ws.pathLen - ws.path[ws.path.length-1].length,
      },
    });
  }

  componentDidMount() {
    let xhr = this.fetchData();
    this.setState({"xhr": xhr});
  }

  render() {
    if (this.state.status == "unloaded") {
      return e("span", null, "Loading...");
    }
    if (this.state.status == "error") {
      return e("span", null, "Error loading dictionary");
    }
    if (this.state.status == "loaded") {
      const options = prefixMatches(this.state.majorDict,
        this.state.wordState.digits.slice(this.state.wordState.pathLen));
      return e("div", null,
        e(DigitsInput, {"digitsChanged": (digits) => this.digitsChanged(digits)}, null),
        e(Status, {"wordState": this.state.wordState, popWord: () => this.popWord()}, null),
        e(Options, {"wordState": this.state.wordState, "options": options, "wordClicked": (w, len) => this.wordClicked(w, len)}, null),
      );
    }
  }
}

function go() {
  ReactDOM.render(e(Major, {}, null), document.getElementById("root"));
}
