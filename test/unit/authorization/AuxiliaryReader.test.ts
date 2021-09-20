import { CredentialGroup } from '../../../src/authentication/Credentials';
import { AuxiliaryReader } from '../../../src/authorization/AuxiliaryReader';
import type { PermissionReader } from '../../../src/authorization/PermissionReader';
import type { AuxiliaryIdentifierStrategy } from '../../../src/ldp/auxiliary/AuxiliaryIdentifierStrategy';
import type { PermissionSet } from '../../../src/ldp/permissions/Permissions';
import type { ResourceIdentifier } from '../../../src/ldp/representation/ResourceIdentifier';
import { NotImplementedHttpError } from '../../../src/util/errors/NotImplementedHttpError';

describe('An AuxiliaryReader', (): void => {
  const suffix = '.dummy';
  const credentials = {};
  const associatedIdentifier = { path: 'http://test.com/foo' };
  const auxiliaryIdentifier = { path: 'http://test.com/foo.dummy' };
  const permissionSet: PermissionSet = { [CredentialGroup.agent]: { read: true }};
  let source: PermissionReader;
  let strategy: AuxiliaryIdentifierStrategy;
  let reader: AuxiliaryReader;

  beforeEach(async(): Promise<void> => {
    source = {
      canHandle: jest.fn(),
      handle: jest.fn().mockResolvedValue(permissionSet),
      handleSafe: jest.fn().mockResolvedValue(permissionSet),
    };

    strategy = {
      isAuxiliaryIdentifier: jest.fn((identifier: ResourceIdentifier): boolean => identifier.path.endsWith(suffix)),
      getAssociatedIdentifier: jest.fn((identifier: ResourceIdentifier): ResourceIdentifier =>
        ({ path: identifier.path.slice(0, -suffix.length) })),
    } as any;
    reader = new AuxiliaryReader(source, strategy);
  });

  it('can handle auxiliary resources if the source supports the associated resource.', async(): Promise<void> => {
    await expect(reader.canHandle({ identifier: auxiliaryIdentifier, credentials }))
      .resolves.toBeUndefined();
    expect(source.canHandle).toHaveBeenLastCalledWith(
      { identifier: associatedIdentifier, credentials },
    );
    await expect(reader.canHandle({ identifier: associatedIdentifier, credentials }))
      .rejects.toThrow(NotImplementedHttpError);
    source.canHandle = jest.fn().mockRejectedValue(new Error('no source support'));
    await expect(reader.canHandle({ identifier: auxiliaryIdentifier, credentials }))
      .rejects.toThrow('no source support');
  });

  it('handles resources by sending the updated parameters to the source.', async(): Promise<void> => {
    await expect(reader.handle({ identifier: auxiliaryIdentifier, credentials }))
      .resolves.toBe(permissionSet);
    expect(source.handle).toHaveBeenLastCalledWith(
      { identifier: associatedIdentifier, credentials },
    );
    // Safety checks are not present when calling `handle`
    await expect(reader.handle({ identifier: associatedIdentifier, credentials }))
      .rejects.toThrow(NotImplementedHttpError);
  });

  it('combines both checking and handling when calling handleSafe.', async(): Promise<void> => {
    await expect(reader.handleSafe({ identifier: auxiliaryIdentifier, credentials }))
      .resolves.toBe(permissionSet);
    expect(source.handleSafe).toHaveBeenLastCalledWith(
      { identifier: associatedIdentifier, credentials },
    );
    await expect(reader.handleSafe({ identifier: associatedIdentifier, credentials }))
      .rejects.toThrow(NotImplementedHttpError);
    source.handleSafe = jest.fn().mockRejectedValue(new Error('no source support'));
    await expect(reader.handleSafe({ identifier: auxiliaryIdentifier, credentials }))
      .rejects.toThrow('no source support');
  });
});