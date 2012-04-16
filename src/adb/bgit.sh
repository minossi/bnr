#! /usr/bin/env bash

echo "
      [USAGE][c/co/b/db/rb/drb/t/dt/rt/drt/pl/ps/f]
      
      [c]:          clone                   - [c]   [workspace] [remote repository]
      [co]:         checkout branch         - [co]  [workspace] [branch]
      [b]:          new branch              - [b]   [workspace] [branch]
      [db]:         delete branch           - [db]  [workspace] [branch]
      [rb]:         new remote branch       - [rb]  [workspace] [branch]
      [drb]:        delete remote branch    - [drb] [workspace] [branch]
      [t]:          tag                     - [t]   [workspace] [tag] [branch]
      [dt]:         delete tag              - [dt]  [workspace] [tag]
      [rt]:         remotetag               - [rt]  [workspace] [tag] [branch]
      [drt]:        delete remote tag       - [drt] [workspace] [tag]
      [pl]:         pull                    - [pl]
      [ps]:         push                    - [ps]  [branch]
      [f]:          fetch                   - [f]
--------------------------------------------------------------------------------
"
echo "[workspace]:" $1
echo "[command]:" $2

cmd_var=$1

ws_var=$2
p_branch=$2

branch_var=$3
tag_var=$3
remote_var=$3

t_branch_var=$4


echo "Changing to Desktop directory"
echo $ws_var
cd $ws_var
pwd


if [ "$cmd_var" == "c" ]; then
    
    echo "Cloning"
	
	rm -rf *
	
    git clone $remote_var

elif [ "$cmd_var" == "co" ]; then
    
    echo "Creating a new branch"
    git checkout $branch_var

elif [ "$cmd_var" == "b" ]; then
    
    echo "Creating a new branch"
    git branch $branch_var master

elif [ "$cmd_var" == "db" ]; then
    
    echo "Deleting branch"
    git branch -d $branch_var

elif [ "$cmd_var" == "rb" ]; then
    
    echo "Creating a new remote branch"
    git branch $branch_var master
    git push -u origin $branch_var

elif [ "$cmd_var" == "drb" ]; then
    
    echo "Deleting remote branch"
    git branch -d $branch_var
    git push -u origin ":"$branch_var

elif [ "$cmd_var" == "t" ]; then
    
    echo "Tagging"
    git tag $tag_var $branch_var

elif [ "$cmd_var" == "dt" ]; then
    
    echo "Deleting Tag"
    git tag -d $tag_var

elif [ "$cmd_var" == "rt" ]; then
    
    echo "Tagging remote tag"
    git tag $tag_var $branch_var
    git push -u origin tag $tag_var

elif [ "$cmd_var" == "drt" ]; then
    
    echo "Deleting remote tag"
    git tag -d $tag_var
    git push origin ":refs/tags/"$tag_var

elif [ "$cmd_var" == "pl" ]; then
    
    echo "Pulling"
    git pull

elif [ "$cmd_var" == "cp" ]; then

	echo "Changing directory"
	
	cp -aR ./bin ../rt/
	
elif [ "$cmd_var" == "ps" ]; then
    
    echo "Pushing"
	
	git add .
	git commit -a -m "binary version"
    git push -u origin $p_branch
    

elif [ "$cmd_var" == "f" ]; then
    
    echo "Fetching"
    git fetch

else

    echo "Git version"
    git version
    echo "!!!READ USAGE"
    
fi




