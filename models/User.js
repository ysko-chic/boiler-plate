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

userSchema.methods.comparePassword = function(plainPassword, callback) {
    // plainPassword와 암호화된 비밀번호 비교
    // plainPassword도 암호화 하여 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    })
}

userSchema.methods.generateToken = function(callback) {
    let user = this;

    // jsonwebtoken을 이용하여 token을 생성하기
    let token = jwt.sign(user._id.toHexString(), "secretToken");
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