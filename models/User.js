const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; // 비밀번호가 10자리
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        maxlength: 100
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

// Schema의 변화에 저장(save)이 이루어질때 선행되어야 하는 부분
// next는 선행되어야 할 부분이 끝나면 다음 단계로 넘어가도록 하는 함수
userSchema.pre('save', function(next) {
    let user = this;
    if (user.isModified('password')) {
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function(err, hash) { // hash 암호화된 비밀번호
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

// mongoose Schema의 메소드를 만들 수 있는 methods
userSchema.methods.comparePassword = function(plainPassword, callback) {
    // plainPassword와 암호화된 비밀번호 비교
    // plainPassword도 암호화 하여 비교
    // plainPassword는 사용자가 입력한 값
    // this 관련 정보는 userSchema이며 mongoDB에 저장된 값이다.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    })
}

userSchema.methods.generateToken = function(callback) {
    let user = this;

    // jsonwebtoken을 이용하여 token을 생성하기
    let token = jwt.sign(user._id.toHexString(), "secretToken");

    // 토큰을 생성하여 저장한다.
    user.token = token;
    user.save(function(err, user) {
        if (err) return callback(err);
        callback(null, user);
    })
}

userSchema.statics.findByToken = function(token, callback) {
    let user = this;

    // 토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decode) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id": decode, "token": token}, function(err, user) {
            if (err) return callback(err);
            callback(null, user);
        })
    })
}

const User = mongoose.model("User", userSchema);

module.exports = { User };