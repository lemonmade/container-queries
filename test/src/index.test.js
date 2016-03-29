import 'test-helper';
import DefaultExport from '../../src/index';
import ContainerQuery from 'components/ContainerQuery';

describe('ContainerQuery', () => {
  it('exports the ContainerQuery class', () => {
    expect(DefaultExport).to.equal(ContainerQuery);
  });
});
