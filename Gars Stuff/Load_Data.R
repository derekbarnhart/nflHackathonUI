library(jsonlite)
library(ggplot2) 
library(magrittr)
library(plyr)
library(parsedate)

options(digits.secs=2)
options(digits=15)
        
suppressWarnings(suppressMessages(library(tidyr)))
suppressWarnings(suppressMessages(library(dplyr)))

game1 <- jsonlite::stream_in(file('~/Desktop/NFLHackathon/Game1/full-game-1.json'), flatten = TRUE)
game2 <- jsonlite::stream_in(file('~/Desktop/NFLHackathon/Game2/full-game-2.json'), flatten = TRUE)
game2 <- game2[!(game2$gsisPlayId %in% c(4220)),]
game3 <- jsonlite::stream_in(file('~/Desktop/NFLHackathon/Game3/full-game-3.json'), flatten = TRUE)


#########
## Roster 
roster1 <- getRoster('~/Desktop/NFLHackathon/Game1/team1.json')
roster2 <- getRoster('~/Desktop/NFLHackathon/Game1/team2.json')
roster3 <- getRoster('~/Desktop/NFLHackathon/Game2/team3.json')
roster4 <- getRoster('~/Desktop/NFLHackathon/Game2/team4.json')
roster5 <- getRoster('~/Desktop/NFLHackathon/Game3/team5.json')
roster6 <- getRoster('~/Desktop/NFLHackathon/Game3/team6.json')
all_roster <- rbind(roster1,roster2,roster3,roster4,roster5,roster6) %>% 
  tbl_df
rm(list = c("roster1","roster2","roster3","roster4","roster5","roster6"))

all_roster <- colwise(as.factor)(all_roster) %>% tbl_df


#########
## Game 1
game_data_1 <- game1 %>% 
  select(-homeTrackingData, -awayTrackingData) %>% 
  flatten %>% 
  select(-play.playStats) %>% 
  tbl_df
game_data_1$play.timeOfDayUTC <- parsedate::parse_iso_8601(game_data_1$play.timeOfDayUTC)

play_data_1 <- game1 %>% 
  flatten %>% 
  select(gameId, ngsPlayId, gsisPlayId, play.playStats) %>% 
  tbl_df

play_data_1 <- plyr::ddply(play_data_1, .(gameId, ngsPlayId, gsisPlayId), function(x){
  x$play.playStats[[1]]
}) %>% tbl_df

tracking_data_1 <- game1 %>% 
  select(-play, -schedule) %>% 
  flatten %>% 
  tbl_df

player_tracking_data_1 <- plyr::ddply(tracking_data_1,.(gameId, ngsPlayId, gsisPlayId), function(x){
  
  homeTeam <- getPlayerData(x$homeTrackingData[[1]])
  homeTeam$team <- "HOME"
  
  awayTeam <- getPlayerData(x$awayTrackingData[[1]])
  awayTeam$team <- "AWAY"
  
  rbind.fill(homeTeam, awayTeam)
  
}) %>% tbl_df



#########
## Game 2
game_data_2 <- game2 %>% 
  select(-homeTrackingData, -awayTrackingData) %>% 
  flatten %>% 
  select(-play.playStats) %>% 
  tbl_df

play_data_2 <- game2 %>% 
  flatten %>% 
  select(gameId, ngsPlayId, gsisPlayId, play.playStats) %>% 
  tbl_df

play_data_2 <- plyr::ddply(play_data_2, .(gameId, ngsPlayId, gsisPlayId), function(x){
  x$play.playStats[[1]]
}) %>% tbl_df

tracking_data_2 <- game2 %>% 
  select(-play, -schedule) %>% 
  flatten %>% 
  tbl_df

player_tracking_data_2 <- plyr::ddply(tracking_data_2,.(gameId, ngsPlayId, gsisPlayId), function(x){
  
  homeTeam <- getPlayerData(x$homeTrackingData[[1]])

  homeTeam$team <- "HOME"
  
  awayTeam <- getPlayerData(x$awayTrackingData[[1]])
  awayTeam$team <- "AWAY"
  
  rbind.fill(homeTeam, awayTeam)
  
}) %>% tbl_df



#########
## Game 3
game_data_3 <- game3 %>% 
  select(-homeTrackingData, -awayTrackingData) %>% 
  flatten %>% 
  select(-play.playStats) %>% 
  tbl_df

play_data_3 <- game3 %>% 
  flatten %>% 
  select(gameId, ngsPlayId, gsisPlayId, play.playStats) %>% 
  tbl_df

play_data_3 <- plyr::ddply(play_data_3, .(gameId, ngsPlayId, gsisPlayId), function(x){
  x$play.playStats[[1]]
}) %>% tbl_df

tracking_data_3 <- game3 %>% 
  select(-play, -schedule) %>% 
  flatten %>% 
  tbl_df

player_tracking_data_3 <- plyr::ddply(tracking_data_3,.(gameId, ngsPlayId, gsisPlayId), function(x){
  
  homeTeam <- getPlayerData(x$homeTrackingData[[1]])
  homeTeam$team <- "HOME"
  
  awayTeam <- getPlayerData(x$awayTrackingData[[1]])
  awayTeam$team <- "AWAY"
  
  rbind.fill(homeTeam, awayTeam)
  
}) %>% tbl_df







## All Data
all_player_tracking_data <- rbind(player_tracking_data_1, player_tracking_data_2, player_tracking_data_3)
all_player_tracking_data$gameId <- as.factor(all_player_tracking_data$gameId)
all_player_tracking_data$ngsPlayId <- as.factor(all_player_tracking_data$ngsPlayId)
all_player_tracking_data$gsisPlayId <- as.factor(all_player_tracking_data$gsisPlayId)
all_player_tracking_data$nflId <- as.factor(all_player_tracking_data$nflId)
all_player_tracking_data$event <- as.factor(all_player_tracking_data$event)
all_player_tracking_data$team <- as.factor(all_player_tracking_data$team)

all_player_tracking_data$time1 <- substr(all_player_tracking_data$time,
                                       1,
                                       nchar(all_player_tracking_data$time)-4) %>% 
strptime("%Y-%m-%dT%H:%M:%OS", tz = "UTC") %>% 
as.POSIXct

all_player_tracking_data$millisecs <- substr(all_player_tracking_data$time,
                                           nchar(all_player_tracking_data$time)-2,
                                           nchar(all_player_tracking_data$time)) %>% 
as.numeric

all_player_tracking_data$millisecs_since_epoch <- as.numeric(all_player_tracking_data$time1) + all_player_tracking_data$millisecs/1000
all_player_tracking_data$time1 <- NULL
all_player_tracking_data$millisecs <- NULL
  
  
rm(list = c("player_tracking_data_1", "player_tracking_data_2", "player_tracking_data_3"))
rm(list = c("tracking_data_1", "tracking_data_2", "tracking_data_3"))

all_game_data = rbind(game_data_1, game_data_2, game_data_3)
all_game_data <- colwise(as.factor)(all_game_data)
all_game_data$play.absoluteYardlineNumber <- as.numeric(as.character(all_game_data$play.absoluteYardlineNumber))
all_game_data$play.yardlineNumber <- as.numeric(as.character(all_game_data$play.yardlineNumber))
all_game_data$play.yardsToGo <- as.numeric(as.character(all_game_data$play.yardsToGo))
all_game_data <- all_game_data %>% tbl_df
rm(list = c("game_data_1","game_data_2","game_data_3"))

all_play_data <- rbind(play_data_1, play_data_2, play_data_3)
all_play_data[,1:6] <- lapply(all_play_data[,1:6], as.factor) 
rm(list = c("play_data_1","play_data_2","play_data_3"))


## Tidy up
rm(list = c("game1", "game2", "game3"))

