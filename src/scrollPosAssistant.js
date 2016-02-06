'use strict';

import { canUseDOM } from 'exenv';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

const DIRECTIONS = {
  UP: 1,
  DOWN: -1
};

function scrollPosAssistant() {
  return (ComposedComponent) => class Scrollcontext extends React.Component {
    static propTypes = {
      boundaryQ: React.PropTypes.string.isRequired
    };

    constructor(props, context) {
      super(props, context);
      this.onScroll = this.onScroll.bind(this);
      this.onResize = this.onResize.bind(this);

      /**
       * Current scroll direction.
       * Note: currently unused, but will become valuable in more advanced use cases.
       */
      this.scrollDir = DIRECTIONS.DOWN;

      /**
       * Previous Y scroll coordinate.
       */
      this.scrollPrev = 0;

      this.state = {
        isVisible: false,
        boundaryY: null
      }
    }

    componentDidMount() {
      if (!canUseDOM) return;
      window.setTimeout(() => {
        this.init();
        window.addEventListener('scroll', this.onScroll);
        window.addEventListener('resize', this.onResize);
      }, 100);
    }

    componentWillUnmount() {
      if (!canUseDOM) return;
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
    }

    shouldComponentUpdate() {
      return PureRenderMixin.shouldComponentUpdate.apply(this, arguments);
    }

    init() {
      const boundaryY = this.calculateBoundary();
      const scrollPos = this.calculateScrollPos();
      this.scrollPrev = scrollPos;
      this.setState({
        isVisible: this.isVisible(scrollPos, boundaryY),
        boundaryY: boundaryY
      });
    }

    calculateScrollPos() {
      return window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
    }

    calculateBoundary() {
      return document.querySelector(this.props.boundaryQ).offsetTop;
    }

    isVisible(scrollPos, boundaryY) {
      return scrollPos >= boundaryY;
    }

    onScroll() {
      const pos = this.calculateScrollPos();
      this.scrollDir = (pos > this.scrollPrev) ? DIRECTIONS.DOWN : DIRECTIONS.UP;
      this.scrollPrev = pos;
      this.setState({ isVisible: this.isVisible(pos, this.state.boundaryY) });
    }

    onResize() {
      this.init();
    }

    render() {
      const props = {
        isVisible: this.state.isVisible,
        ...this.props
      };
      return <ComposedComponent {...props} />;
    }
  }
}

export default scrollPosAssistant;
