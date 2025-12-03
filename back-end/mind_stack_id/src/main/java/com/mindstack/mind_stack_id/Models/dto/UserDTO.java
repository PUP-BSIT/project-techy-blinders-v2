package com.mindstack.mind_stack_id.models.dto;

public class UserDTO {
    private String username;
    private long userId;

    public UserDTO(){}

    public UserDTO(String username, long userId) {
        this.userId = userId;
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public long getUserId() {
        return userId;
    }
}