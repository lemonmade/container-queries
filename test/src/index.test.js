import '../helper';

import DefaultExport from '../../src/index';
import ContainerQuery from '../../src/components/ContainerQuery';

describe('ContainerQuery', () => {
  it('exports the ContainerQuery class', () => {
    expect(DefaultExport).to.equal(ContainerQuery);
  });
});
