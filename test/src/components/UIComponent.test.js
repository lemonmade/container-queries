import '../../helper';

import UIComponent from '../../../src/components/UIComponent';
import DOMCache from '../../../src/components/DOMCache';

describe('UIComponent', () => {
  let nodeOne;
  let nodeTwo;
  let myComponent;
  let MyComponent;

  beforeEach(() => {
    nodeOne = document.createElement('div');
    nodeOne.className = 'my-component';
    nodeTwo = nodeOne.cloneNode(false);
    [nodeOne, nodeTwo].forEach((node) => document.body.appendChild(node));

    MyComponent = class MyComponent extends UIComponent { // eslint-disable-line no-shadow
      static selector = '.my-component'
    };
  });

  afterEach(() => {
    [nodeOne, nodeTwo].forEach((node) => document.body.removeChild(node));
  });

  describe('.identifier', () => {
    it('uses the name of the component', () => {
      expect(MyComponent.identifier).to.equal('MyComponent');
    });
  });

  describe('.for()', () => {
    it('returns nothing if the node is null', () => {
      expect(MyComponent.for(null)).to.be.null;
    });

    it('returns the cached object for the component identifier', () => {
      expect(MyComponent.for(nodeOne)).to.be.undefined;

      let cachedObject = {foo: 'bar'};
      DOMCache.setValueForNode(nodeOne, {key: MyComponent.identifier, value: cachedObject});
      expect(MyComponent.for(nodeOne)).to.equal(cachedObject);
    });
  });

  describe('.create()', () => {
    let constructorSpy;

    beforeEach(() => {
      constructorSpy = sinon.spy();

      MyComponent = class MyComponent extends UIComponent { // eslint-disable-line no-shadow
        static selector = '.my-component'

        constructor(...args) {
          super(...args);
          constructorSpy(...args);
        }
      };

      sinon.stub(MyComponent, 'for');
    });

    afterEach(() => {
      MyComponent.for.restore && MyComponent.for.restore();
    });

    context('when a node is passed', () => {
      it('returns a non-null result of .for()', () => {
        let myObject = {};
        MyComponent.for.returns(myObject);

        expect(MyComponent.create(nodeOne)).to.equal(myObject);
        expect(MyComponent.for).to.have.been.calledWith(nodeOne);
      });

      it('creates a new instance when for does not return anything', () => {
        expect(MyComponent.create(nodeOne)).to.be.an.instanceOf(MyComponent);
      });

      it('passes arguments to the constructor', () => {
        MyComponent.create(nodeOne, 'foo', 'bar');
        expect(constructorSpy).to.have.been.calledWith(nodeOne, 'foo', 'bar');
      });
    });

    context('when an array-like is passed', () => {
      it('creates returns an array of constructed objects', () => {
        let created = MyComponent.create(document.querySelectorAll(`.${nodeOne.className}`));
        MyComponent.for.restore();

        expect(created).to.have.length(2);
        expect(created[0]).to.equal(MyComponent.for(nodeOne));
        expect(created[1]).to.equal(MyComponent.for(nodeTwo));
      });

      it('uses cached versions if they exist', () => {
        MyComponent.for.returns({});
        MyComponent.create([nodeOne, nodeTwo]);

        expect(MyComponent.for).to.have.been.calledTwice;
        expect(constructorSpy).not.to.have.been.called;
      });

      it('passes arguments to the constructor', () => {
        MyComponent.create(document.querySelectorAll(`.${nodeOne.className}`), 'foo', 'bar');

        expect(constructorSpy).to.have.been.calledTwice;
        [nodeOne, nodeTwo].forEach((node) => {
          expect(constructorSpy).to.have.been.calledWith(node, 'foo', 'bar');
        });
      });
    });

    context('when a string is passed', () => {
      it('creates and returns an array of constructed objects from querying the selector', () => {
        expect(MyComponent.create('.not-matching')).to.be.empty;

        let created = MyComponent.create(`.${nodeOne.className}`);
        MyComponent.for.restore();

        expect(created).to.have.length(2);
        expect(created[0]).to.equal(MyComponent.for(nodeOne));
        expect(created[1]).to.equal(MyComponent.for(nodeTwo));
      });
    });
  });

  describe('.createAllWithin()', () => {
    beforeEach(() => {
      sinon.stub(MyComponent, 'create', (node) => node);
    });

    afterEach(() => {
      MyComponent.create.restore();
    });

    it('calls create for every node matching the selector', () => {
      let nodes = [nodeOne, nodeTwo];
      let created = MyComponent.createAllWithin(document.body);

      expect(MyComponent.create).to.have.been.calledWith(nodes);
      expect(created).to.deep.equal(nodes);
    });

    it('passes along any arguments to each create call', () => {
      MyComponent.createAllWithin(document.body, 'foo', 'bar');
      expect(MyComponent.create).to.have.been.calledWith([nodeOne, nodeTwo], 'foo', 'bar');
    });

    it('does not create for non-matching nodes', () => {
      nodeTwo.className = 'not-matching';
      MyComponent.createAllWithin(document.body);

      expect(MyComponent.create).to.have.been.calledOnce;
      expect(MyComponent.create).to.have.been.calledWith([nodeOne]);
    });
  });

  describe('.destroyAllWithin()', () => {
    it('calls destroy on all contained object instances', () => {
      let components = [nodeOne, nodeTwo].map((node) => new MyComponent(node));
      components.forEach((component) => sinon.spy(component, 'destroy'));

      MyComponent.destroyAllWithin(document.body);

      components.forEach((component) => {
        expect(component.destroy).to.have.been.called;
      });
    });
  });

  describe('.allWithin()', () => {
    context('when there is no selector', () => {
      it('returns an empty array', () => {
        delete MyComponent.selector;
        myComponent = new MyComponent(nodeOne);
        expect(MyComponent.allWithin(document.body)).to.be.empty;
      });
    });

    context('when there is a selector', () => {
      it('returns the cached objects for all nodes matching the selector', () => {
        nodeTwo.className = 'not-matching';
        [nodeOne, nodeTwo].forEach((node) => new MyComponent(node));

        expect(MyComponent.allWithin(document.body)).to.have.length(1);
        expect(MyComponent.allWithin(document.body)[0]).to.equal(MyComponent.for(nodeOne));
      });

      it('only returns objects that have actually been created', () => {
        myComponent = new MyComponent(nodeTwo);

        let allWithin = MyComponent.allWithin(document.body);
        expect(allWithin).to.have.length(1);
        expect(allWithin[0]).to.equal(MyComponent.for(nodeTwo));
        expect(allWithin[0]).to.equal(myComponent);
      });

      it('only returns objects that match the calling class', () => {
        class OtherComponent extends UIComponent {}

        myComponent = new MyComponent(nodeOne);
        let otherComponent = new OtherComponent(nodeTwo);

        let allWithin = MyComponent.allWithin(document.body);
        expect(allWithin).to.have.length(1);
        expect(allWithin[0]).to.equal(MyComponent.for(nodeOne));
        expect(allWithin[0]).not.to.equal(otherComponent);
      });
    });
  });

  describe('#constructor()', () => {
    it('caches the element to its DOM node at the identifier of the component', () => {
      myComponent = new MyComponent(nodeOne);
      expect(DOMCache.getValueForNode(nodeOne, {key: MyComponent.identifier})).to.equal(myComponent);
    });

    it('does not do anything when no node is passed', () => {
      expect(() => new MyComponent()).not.to.throw(Error);
    });
  });

  describe('#destroy()', () => {
    it('caches the element to its DOM node at the identifier of the component', () => {
      myComponent = new MyComponent(nodeOne);
      myComponent.destroy();
      expect(DOMCache.getValueForNode(nodeOne, {key: MyComponent.identifier})).to.be.undefined;
    });

    it('does not do anything when no node was passed', () => {
      expect(() => new MyComponent().destroy()).not.to.throw(Error);
    });
  });
});
