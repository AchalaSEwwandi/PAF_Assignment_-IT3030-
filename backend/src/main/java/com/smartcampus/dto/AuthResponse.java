package com.smartcampus.dto;

import com.smartcampus.model.User;

public class AuthResponse {
    
    private String jwt;
    private User user;
    private String message;
    
    public AuthResponse(String jwt, User user) {
        this.jwt = jwt;
        this.user = user;
    }
    
    public AuthResponse(String message) {
        this.message = message;
    }
    
    // Getters and setters
    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
