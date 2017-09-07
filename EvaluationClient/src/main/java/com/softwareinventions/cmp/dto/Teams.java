package com.softwareinventions.cmp.dto;

import java.util.Date;

public class Teams {
	private int id;
	private String teamName;
	private int bestScore;
	private Date lastSubmit;
	private boolean canSubmit;
	
	public int getId() {
		return id;
	}
	public String getTeamName() {
		return teamName;
	}
	public int getBestScore() {
		return bestScore;
	}
	public Date getLastSubmit() {
		return lastSubmit;
	}
	public boolean isCanSubmit() {
		return canSubmit;
	}
	
	public void setId(int id) {
		this.id = id;
	}
	public void setTeamName(String teamName) {
		this.teamName = teamName;
	}
	public void setBestScore(int bestScore) {
		this.bestScore = bestScore;
	}
	public void setLastSubmit(Date lastSubmit) {
		this.lastSubmit = lastSubmit;
	}
	public void setCanSubmit(boolean canSubmit) {
		this.canSubmit = canSubmit;
	}
	
	
}
