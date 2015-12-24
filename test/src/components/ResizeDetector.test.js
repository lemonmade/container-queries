import '../../helper';

import ResizeDetector from '../../../src/components/ResizeDetector';

describe('ResizeDetector', () => {
  let objectStub;
  let node;
  let detector;

  beforeEach(() => {
    node = document.createElement('div');
    node.appendChild(document.createElement('div'));

    objectStub = {
      setAttribute(attr, value) { this[attr] = value; },
      style: {},
      contentDocument: {
        defaultView: {
          addEventListener: sinon.spy(),
          removeEventListener: sinon.spy(),
        },
        body: {clientWidth: 0},
        readyState: '',
      },
    };

    sinon.stub(document, 'createElement').returns(objectStub);
    sinon.stub(window.Node.prototype, 'appendChild');

    detector = new ResizeDetector(node);
  });

  afterEach(() => {
    detector.destroy();
    document.createElement.restore();
    window.Node.prototype.appendChild.restore();
  });

  describe('.for()', () => {
    it('uses an existing resize detector if created', () => {
      expect(detector === ResizeDetector.for(node)).to.be.true;
    });
  });

  describe('resize object', () => {
    it('does not append an object until a listener is added', () => {
      expect(node.appendChild).not.to.have.been.called;
      detector.addListener(sinon.spy());
      expect(node.appendChild).to.have.been.calledWith(objectStub);
    });

    it('does not append an object if the node does not exist', () => {
      detector = new ResizeDetector();
      expect(document.createElement).not.to.have.been.called;
    });

    it('only appends a single object', () => {
      detector.addListener(sinon.spy());
      detector.addListener(sinon.spy());
      expect(node.appendChild).to.have.been.calledOnce;
    });

    it('appends an out-of-document-flow object to the root node', () => {
      detector.addListener(sinon.spy());

      let expectedStyle = {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        'pointer-events': 'none',
        'z-index': -1,
      };

      expect(objectStub).to.have.property('tabindex', -1);
      expect(objectStub).to.have.property('data', 'about:blank');

      let style = objectStub.style.cssText;
      Object.keys(expectedStyle).forEach((property) => {
        expect(style).to.include(`${property}: ${expectedStyle[property]}`);
      });
    });

    it('updates the node to be relatively positioned', () => {
      node.style.position = 'static';
      detector.addListener(sinon.spy());
      expect(node.style.position).to.equal('relative');
    });

    ['relative', 'absolute', 'fixed'].forEach((positioning) => {
      it(`does not update '${positioning}' positioning of the node`, () => {
        node.style.position = positioning;
        detector.addListener(sinon.spy());
        expect(node.style.position).to.equal(positioning);
      });
    });

    it('calls #update() on load and attaches a listener for resizes', () => {
      sinon.stub(detector, 'update');

      detector.addListener(sinon.spy());
      expect(detector.update).not.to.have.been.called;

      objectStub.onload({target: objectStub});
      expect(detector.update).to.have.been.called;

      let addEventListenerArgs = objectStub.contentDocument.defaultView.addEventListener.firstCall.args;
      addEventListenerArgs[1]();
      expect(addEventListenerArgs[0]).to.equal('resize');
      expect(detector.update).to.have.been.calledTwice;
    });

    it('does not create a listener if there is no node', () => {
      detector = new ResizeDetector();
      expect(() => detector.addListener(sinon.spy())).not.to.throw(Error);
    });
  });

  describe('#addListener', () => {
    let listener;

    beforeEach(() => {
      listener = sinon.spy();
      node.offsetWidth = 555;
    });

    it('adds a listener that is called on update', () => {
      detector.addListener(listener);
      detector.update();

      expect(listener).to.have.been.calledWith(node.offsetWidth);
    });

    it('calls the listener immediately if the object has loaded', () => {
      objectStub.contentDocument.readyState = 'complete';
      detector.addListener(listener);
      expect(listener).to.have.been.calledWith(node.offsetWidth);
    });

    it('does not call the listener immediately if the object has not loaded', () => {
      objectStub.contentDocument = null;
      detector.addListener(listener);
      expect(listener).not.to.have.been.calledWith(node.offsetWidth);
    });

    it('does not call the listener immediately if the object is not ready', () => {
      objectStub.contentDocument.readyState = '';
      detector.addListener(listener);
      expect(listener).not.to.have.been.calledWith(node.offsetWidth);
    });
  });

  describe('#removeListener', () => {
    let listener;

    beforeEach(() => {
      listener = sinon.spy();
    });

    it('destroys itself when the last listener is removed', () => {
      sinon.stub(detector, 'destroy');
      detector.addListener(listener);
      detector.removeListener(listener);

      expect(detector.destroy).to.have.been.called;
    });

    it('does not destroy itself when the preserve option is passed', () => {
      sinon.stub(detector, 'destroy');
      detector.addListener(listener);
      detector.removeListener(listener, {preserve: true});

      expect(detector.destroy).not.to.have.been.called;
    });

    it('adds does not call a removed listener', () => {
      node.offsetWidth = 555;

      detector.addListener(listener, {preserve: true});
      detector.removeListener(listener);
      detector.update();

      expect(listener).not.to.have.been.called;
    });
  });

  describe('#width', () => {
    it('has a 0 width when there is no node', () => {
      detector = new ResizeDetector();
      expect(detector.width).to.equal(0);
    });

    it('uses the offsetWidth of the node if present', () => {
      let width = 555;
      node.offsetWidth = width;
      expect(detector.width).to.equal(width);
    });
  });

  describe('#destroy()', () => {
    let listener;

    beforeEach(() => {
      listener = sinon.spy();
      detector.addListener(listener); // force the addition of the object
    });

    it('clears out all references', () => {
      detector.destroy();

      expect(detector.node).to.be.undefined;
      expect(objectStub.contentDocument.defaultView.removeEventListener).to.have.been.calledWith('resize', detector.update);
    });

    it('does not choke when no object has been created', () => {
      expect(() => new ResizeDetector().destroy()).not.to.throw(Error);
    });

    it('removes all listeners', () => {
      detector.destroy();
      detector.update();

      expect(listener).not.to.have.been.called;
    });
  });
});
