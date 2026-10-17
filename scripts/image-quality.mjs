import sharp from 'sharp';
function ssim(a,b,w,h,c){let sum=0,n=0;for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8)for(let ch=0;ch<c;ch++){let ma=0,mb=0,aa=0,bb=0,ab=0,count=0;for(let dy=0;dy<8&&y+dy<h;dy++)for(let dx=0;dx<8&&x+dx<w;dx++){const i=((y+dy)*w+x+dx)*c+ch,A=a[i],B=b[i];ma+=A;mb+=B;aa+=A*A;bb+=B*B;ab+=A*B;count++;}ma/=count;mb/=count;const va=Math.max(0,aa/count-ma*ma),vb=Math.max(0,bb/count-mb*mb),cov=ab/count-ma*mb;sum+=((2*ma*mb+6.5025)*(2*cov+58.5225))/((ma*ma+mb*mb+6.5025)*(va+vb+58.5225));n++;}return sum/n;}
export { ssim, sharp };

