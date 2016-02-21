library(jsonlite)
library(ggplot2) 
library(magrittr)
library(plyr)
library(parsedate)

options(digits.secs=2)
options(digits=15)

suppressWarnings(suppressMessages(library(tidyr)))
suppressWarnings(suppressMessages(library(dplyr)))



my.gameId = "1"
my.gsisPlayId = "2582"

description <- filter(all_game_data, gsisPlayId == my.gsisPlayId & gameId == my.gameId)$play.playDescription %>% 
  as.character
play_data <- filter(all_play_data, gsisPlayId == my.gsisPlayId & gameId == my.gameId)
play_tracking_data <- dplyr::filter(all_player_tracking_data, gsisPlayId == my.gsisPlayId & gameId == my.gameId)

involved_players <- play_data$nflId %>% 
    as.character 

analysis_data <- merge(play_tracking_data, all_roster)
#%>% 
 # filter(nflId %in% involved_players) 

max_s <- ddply(all_player_tracking_data, .(nflId), function(xx){
  data.frame(top_speed = max(xx$s))
})
analysis_data <- merge(analysis_data, max_s)

my_z <- ddply(analysis_data, .(nflId), function(z){
  next_x <- z$x
  next_x <- c(next_x[2:length(next_x)], next_x[length(next_x)])
  
  next_y <- z$y
  next_y <- c(next_y[2:length(next_y)], next_y[length(next_y)])
  z$next_x <- next_x
  z$next_y <- next_y
  
  z$circle1_x <- NA
  z$circle1_y <- NA
  z$circle1_r <- NA
  
  z$circle2_x <- NA
  z$circle2_y <- NA
  z$circle2_r <- NA
  
  return(z)
}) %>% tbl_df

# Remove data points that don't exist for all players
n_players = length(unique(my_z$nflId))
time_ok <- c(t(table(as.factor(my_z$time)) == n_players))
time_ok <- names(table(as.factor(my_z$time)))[time_ok]
my_z <- filter(my_z, time %in% time_ok)

my_z$weight_kg <-  as.numeric(as.character(my_z$weight))*0.453592
max_momentum <- 1314
mean_top_speed <- mean(max_s$top_speed)
# loop through each point
for (i in 1:nrow(my_z)) {
  dat <- my_z[i,]
  
  x1 <- dat$x
  x2 <- dat$next_x
  
  y1 <- dat$y
  y2 <- dat$next_y
  
  hyp <- sqrt( (y2-y1)^2 + (x2-x1)^2)
  
  momentum_factor <- dat$weight_kg * dat$s
  top_speed_factor <- dat$top_speed
  
  my_z[i,]$circle1_x <- x1 + (x2 - x1)*10*momentum_factor/max_momentum
  my_z[i,]$circle1_y <- y1 + (y2 - y1)*10*momentum_factor/max_momentum
  my_z[i,]$circle1_r <- (hyp/2) * (1 + dat$s*10/(mean_top_speed))
  
  my_z[i,]$circle2_x <- x1 + (x2 - x1)*20*momentum_factor/max_momentum
  my_z[i,]$circle2_y <- y1 + (y2 - y1)*20*momentum_factor/max_momentum
  my_z[i,]$circle2_r <- (hyp*2/3) * (1 + dat$s*10/(mean_top_speed))
}


write.csv(my_z, file = '~/Desktop/NFLHackathon/sample_play.csv', row.names = FALSE)



my_data1 <- filter(my_z, nflId == '2552478')
my_data2 <- filter(my_z, nflId == '234')

plot_me1 <- my_data1[seq(from = 40, to = 110, by = 2),]
plot_me2 <- my_data2[seq(from = 40, to = 110, by = 2),]

plot_me <- rbind(plot_me2, plot_me1)
# r, xc, yc are the radius and center coordinates
i = 17
r1 <- plot_me[i,]$circle1_r
r2 <- plot_me[i,]$circle2_r
xc1 <- plot_me[i,]$circle1_x
xc2 <- plot_me[i,]$circle2_x
yc1 <- plot_me[i,]$circle1_y
yc2 <- plot_me[i,]$circle2_y

ggplot(data = plot_me ) +
  geom_segment(aes(x = x, y = y, xend = next_x, yend = next_y),
               arrow = arrow(length = unit(0.01, "npc"))) +
  annotate("path",
           x=xc1+r1*cos(seq(0,2*pi,length.out=100)),
           y=yc1+r1*sin(seq(0,2*pi,length.out=100)),
           colour = "green") +
  annotate("path",
           x=xc2+r2*cos(seq(0,2*pi,length.out=100)),
           y=yc2+r2*sin(seq(0,2*pi,length.out=100)),
           colour = "green") +
  coord_fixed(ylim=c(0,55))




ggplot(data = play_tracking_data,#analysis_data,
       aes(x = x, y = y, colour = team, shape = team)) +
  geom_point(alpha= 0.5) +
  coord_fixed(ylim = c(0,55))



