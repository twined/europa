"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildDecl;

var _postcss = _interopRequireDefault(require("postcss"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildDecl(p, value, important = false) {
  const props = [];
  let wrapper = null;

  switch (p) {
    case 'margin-x':
      props.push('margin-left');
      props.push('margin-right');
      break;

    case 'margin-y':
      props.push('margin-top');
      props.push('margin-bottom');
      break;

    case 'margin':
      props.push('margin-left');
      props.push('margin-right');
      props.push('margin-top');
      props.push('margin-bottom');
      break;

    case 'padding-x':
      props.push('padding-left');
      props.push('padding-right');
      break;

    case 'padding-y':
      props.push('padding-top');
      props.push('padding-bottom');
      break;

    case 'padding':
      props.push('padding-left');
      props.push('padding-right');
      props.push('padding-top');
      props.push('padding-bottom');
      break;

    case 'translateX':
      props.push('transform');
      wrapper = 'translateX($VALUE)';
      break;

    case 'translateY':
      props.push('transform');
      wrapper = 'translateY($VALUE)';
      break;

    case 'translateZ':
      props.push('transform');
      wrapper = 'translateZ($VALUE)';
      break;

    case 'scale':
      props.push('transform');
      wrapper = 'scale($VALUE)';
      break;

    default:
      props.push(p);
  }

  return props.map(prop => _postcss.default.decl({
    prop,
    value: wrapper ? wrapper.replace('$VALUE', value) : value,
    important
  }));
}