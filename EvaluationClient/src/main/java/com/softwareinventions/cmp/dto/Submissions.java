package com.softwareinventions.cmp.dto;

import java.util.Date;

public class Submissions {
	private int id;
	private int teamId;
	private Date time;
	private int score;
	private String content;
	private String response;
	
	public int getId() {
		return id;
	}
	public int getTeamId() {
		return teamId;
	}
	public Date getTime() {
		return time;
	}
	public int getScore() {
		return score;
	}
	public String getContent() {
		return content;
	}
	public String getResponse() {
		return response;
	}
	
	public void setId(int id) {
		this.id = id;
	}
	public void setTeamId(int teamId) {
		this.teamId = teamId;
	}
	public void setTime(Date time) {
		this.time = time;
	}
	public void setScore(int score) {
		this.score = score;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public void setResponse(String response) {
		this.response = response;
	}
	
	
}
