import 'egg';
import { Connection, Model } from 'mongoose'
declare module 'egg' {
  interface Context {
    genHash(plainText: string): Promise<string>,
    compare(plainText: string, hash: string): Promise<boolean>
  }
  interface EggAppConfig {
    bcrypt: {
      saltRounds: number;
    }
  }
  interface Application {
    sessionMap: {
      [key: string]: any
    },
    sessionStore: any
  }
}