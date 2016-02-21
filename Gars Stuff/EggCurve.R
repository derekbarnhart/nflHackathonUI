f <- function(x,y,v=1){
  x^2 + y^2 - y^(3/2)
}

x <- seq(-0.5,0.5,length=1000)
y <- seq(0,1,length=1000)

z <- outer(x,y,f)

contour(
  x=x, y=x, z=z, 
  levels=0, las=1, drawlabels=FALSE, lwd=3
)


v = log(11+1) / 8
emdbook::curve3d(((x-0)^2 + (y+0.5 - 2*v)^2 - 1.2*(y+0.5 - 2*v)^(1.5 + v)),
                 #xlim=c(-1,1),
                 xlim=c(-1,1),
                 ylim=c(-2,2),
                 #ylim=c(-10,10),
                 n=c(100,100), 
                 sys3d="wireframe",
                 #levels=0,
                 add = FALSE)


grid()
