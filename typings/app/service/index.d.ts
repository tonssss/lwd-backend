// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportTest from '../../../app/service/Test';
import ExportDog from '../../../app/service/dog';
import ExportUser from '../../../app/service/user';
import ExportWork from '../../../app/service/work';

declare module 'egg' {
  interface IService {
    test: AutoInstanceType<typeof ExportTest>;
    dog: AutoInstanceType<typeof ExportDog>;
    user: AutoInstanceType<typeof ExportUser>;
    work: AutoInstanceType<typeof ExportWork>;
  }
}
