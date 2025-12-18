package com.mindstack.mind_stack_id.models.dto;

public class UserDTO {
    private String username;
    private long userId;
    private String email;

    public UserDTO() {
    }

    public UserDTO(String username, long userId, String email) {
        this.userId = userId;
        this.username = username;
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}