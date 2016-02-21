
getPlayerData <- function(h) {
  plyr::ddply(h, .(nflId), function(y){
    tmp <- y$playerTrackingData[[1]]
    tmp$ndx <- 1:nrow(tmp)
    return(tmp)
  })
}



getRoster <- function(filename) {
  team <- jsonlite::stream_in(file(filename), flatten = TRUE)
  roster <- team$teamPlayers[[1]]
  roster$team.fullName <- team$team$fullName
  return(roster)
}




