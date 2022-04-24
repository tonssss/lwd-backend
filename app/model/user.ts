import { Application } from 'egg'

export interface UserProps {
  username: string;
  password: string;
  email?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'email' | 'cellphone' | 'oauth';
  provider?: 'gitee';
  oauthID?: string;
  role?: 'admin' | 'normal';
}

function initUserModel(app: Application) {
  const UserSchema = new Schema({
    name: { type: String },
    age: { type: Number },
    hobbies: { type: Array },
    team: { type: Schema.Type.ObjectId, ref: 'Team' }
  }, { collection: 'user' })
  return app.mongoose.model('User', UserSchema)
}

export default initUserModel
