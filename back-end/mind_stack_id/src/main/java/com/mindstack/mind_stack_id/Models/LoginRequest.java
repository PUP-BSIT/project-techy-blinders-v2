package com.mindstack.mind_stack_id.Models;

public class LoginRequest {
    private long userId;
    private String password;

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public void setPassword (String password) {
        this.password = password;
    }

    public long getUserId () {
        return userId;
    }

    public String getPassword() {
        return password;
    }
}
