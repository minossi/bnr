#!/bin/sh
#
# multimodule.sh: super proj, sub proj handling(using git submodules)
#
# Copyright (c) 2012 ACTUS

command=
branch=
force=
reference=
cached=
recursive=
init=
files=
nofetch=
update=
prefix=

# Resolve relative url by appending to parent's url
resolve_relative_url ()
{
	remote=$(get_default_remote)
	remoteurl=$(git config "remote.$remote.url") ||
		remoteurl=$(pwd) # the repository is its own authoritative upstream
	url="$1"
	remoteurl=${remoteurl%/}
	sep=/
	while test -n "$url"
	do
		case "$url" in
		../*)
			url="${url#../}"
			case "$remoteurl" in
			*/*)
				remoteurl="${remoteurl%/*}"
				;;
			*:*)
				remoteurl="${remoteurl%:*}"
				sep=:
				;;
			*)
				die "$(eval_gettext "cannot strip one component off url '\$remoteurl'")"
				;;
			esac
			;;
		./*)
			url="${url#./}"
			;;
		*)
			break;;
		esac
	done
	echo "$remoteurl$sep${url%/}"
}

#
# Add a new submodule to the working tree, .gitmodules and the index
#
# $@ = repo path
#
# optional branch is stored in global branch variable
#
cmd_clone()
{
	#1) git clone <repository url> <path>
	#2) cd <path>
	#3) update
	#4) switch to master branch
	if test "$#" != "2"
	then
		usage
	fi
	
	git clone $1 $2 &&
	cd "$2" &&
	update &&
	git submodule foreach 'git checkout master'
}

cmd_branch()
{
    subcmd=
    branch=
    list_flag=
	# parse $args after "multimodule ... branch".
	while test $# -ne 0
	do
		case "$1" in
		-d)    
			subcmd="delete"
			case "$2" in '') echo 'need branch' || exit ;; esac
			branch=$2
			shift
			;;
		-a)
			list_flag="$1"
			;;
		-*)
			usage
			;;
		*)		
			subcmd="create"
			branch=$1
			break
			;;
		esac
		shift
	done
    
	case "$subcmd" in
	create)
		git branch $branch
		git submodule foreach 'git branch '$branch''
		;;
	delete)
		git branch -d $branch
		git submodule foreach 'git branch -d '$branch''
		;;
	*)
		git branch $list_flag
		git submodule foreach 'git branch' $list_flag''
		;;
	esac
}

cmd_tag()
{
    subcmd=
    tag=
    comment=
	# parse $args after "multimodule ... tag".
	while test $# -ne 0
	do
		case "$1" in
		-d) 
			subcmd="delete"
			case "$2" in '') echo 'need branch' || exit ;; esac
			tag=$2
			shift
			;;
		-a)
			subcmd='list_all'
			;;
		-*)
			usage
			;;
		*)		
			subcmd="create"
			tag=$1
			comment=$2
			break
			;;
		esac
		shift
	done
    
	case "$subcmd" in
	create)	    
		if [ -n "$tag" ] && [ -n "$comment" ]
	    then
		    git tag $tag -m '"$comment"'
		    git submodule foreach 'git tag '$tag' -m "'$comment'"'
		else 
		    echo "specify tag & comment you want to create" || exit -1
	    fi
		;;
	delete)
		if [ -n "$tag" ]
	    then
		    git tag -d $tag
		    git submodule foreach 'git tag -d '$tag''
		else 
		    echo "specify tag you want to delete" || exit -1
	    fi
		;;
	list_all)
	    echo ":::local tags:::"
		git tag
		git submodule foreach 'git tag'
	    echo ":::remote tag:::"
		git ls-remote --tags	
		git submodule foreach 'git ls-remote --tags'
		;;
	*)
		git tag
		git submodule foreach 'git tag'
		;;
	esac
}

cmd_checkout()
{
	#1) git checkout <branch>
	#2) git submodule foreach 'git checkout <branch>'
    git checkout $1
    git submodule foreach 'git checkout '$1''
}


# ¿Ã∞« ¡ª ∞ÌπŒ «ÿæﬂ«“ µÌ...
cmd_commit()
{
    ehco "commit"
	#1) sub µ∑∫≈‰∏Æ∑Œ ¿Ãµø ƒøπ‘
	#2) main µ∑∫≈‰∏Æ∑Œ ¿Ãµø ƒøπ‘
}

cmd_status()
{
	#1) git status
	#2) git submodule foreach 'git status'
    git status
    git submodule foreach 'git status'
}

cmd_push()
{
    subcmd=
    remote_url=
    local_ref=
    remote_ref=
	while test $# -ne 0
	do
		case "$1" in
		--tags)
		    subcmd="push_tag"
			break
			;;
		-*)
			usage
			;;
		*)
		    subcmd="push_ref"
	        remote_url=$1
	        local_ref=$2
	        remote_ref=$3
	        break
			;;
		esac
		shift
	done
	
	case "$subcmd" in
	push_tag)	    
        #1) git push --tags
        #2) git submodule foreach 'git push --tags' 
        git push --tags
        git submodule foreach 'git push --tags' 
		;;
	push_ref)
	    echo $remote_url
	    echo $local_ref
	    echo $remote_ref
		if [ -n "$remote_url" ] && [ -n "$remote_ref" ] 
	    then
	        #1) git push <remote repo> <local_ref>:<remote_ref>
	        #2) git submodule foreach 'git push <remote repo> <local_ref>:<remote_ref>'
	        git push $remote_url $local_ref:$remote_ref
	        git submodule foreach 'git push '$remote_url' '$local_ref':'$remote_ref''
		else 
		    echo "specify remote url, local ref, remote ref you want to push" || exit -1
	    fi
		;;
	esac
	
}

cmd_pull()
{
	#1) git pull <remote repo> <local_ref>:<remote_ref>
	#2) git submodule foreach 'git pull <remote repo> <remote_ref>:<local_ref>'
		
	git pull $1 $2:$3
	git submodule foreach 'git pull '$1' '$2':'$3''
}

update()
{
	#1) copy .gitmodules to .gitmodules.bak
	runcp=$(cp .gitmodules .gitmodules.bak)
	
	#2) url_change
	url_change
	
	#3) git submodule update --init
	runupdate=$(git submodule update --init)	
	
	#4) mv .gitmodules.bak .gitmodules
	runmv=$(mv .gitmodules.bak .gitmodules)
}

#
# Map submodule path to submodule name
#
# $1 = path
#
module_name()
{
	# Do we have "submodule.<something>.path = $1" defined in .gitmodules file?
	re=$(printf '%s\n' "$1" | sed -e 's/[].[^$\\*]/\\&/g')
	name=$( git config -f .gitmodules --get-regexp '^submodule\..*\.path$' |
		sed -n -e 's|^submodule\.\(.*\)\.path '"$re"'$|\1|p' )
	test -z "$name" &&
	echo "No submodule mapping found in .gitmodules for path '\$path'"
	echo "$name"
}

#
# Get submodule info for registered submodules
# $@ = path to limit submodule list
#
module_list()
{
	git ls-files --error-unmatch --stage -- "$@" |
	perl -e '
	my %unmerged = ();
	my ($null_sha1) = ("0" x 40);
	while (<STDIN>) {
		chomp;
		my ($mode, $sha1, $stage, $path) =
			/^([0-7]+) ([0-9a-f]{40}) ([0-3])\t(.*)$/;
		next unless $mode eq "160000";
		if ($stage ne "0") {
			if (!$unmerged{$path}++) {
				print "$mode $null_sha1 U\t$path\n";
			}
			next;
		}
		print "$_\n";
	}
	'
}

#
# Change repository url with user name
#
# $1 = repository url
#
url_change()
{
	module_list |
	while read mode sha1 stage path
	do
		#echo "path = $path"
		name=$(module_name "$path") || exit
		url=$(git config -f .gitmodules submodule."$name".url)
		username=$(git config user.name)
		#echo "repo url, username : $url, $username"
		url_with_username=$(git config -f .gitmodules submodule."$name".url |
			sed -e 's|ssh:\/\/|ssh:\/\/'"$username"@'|g' )
		#echo "repo url with user-id : $url_with_username"
		change=$(git config -f .gitmodules submodule."$name".url "$url_with_username")
		#echo "$change"
	done
}


set_name_rev () {
	revname=$( (
		clear_local_git_env
		cd "$1" && {
			git describe "$2" 2>/dev/null ||
			git describe --tags "$2" 2>/dev/null ||
			git describe --contains "$2" 2>/dev/null ||
			git describe --all --always "$2"
		}
	) )
	test -z "$revname" || revname=" ($revname)"
}

usage () 
{
    echo "usage: multimodule clone <repository url> <subproj_path>"
    echo "   or: multimodule branch [-d] [-a] [<branch>]"
    echo "   or: multimodule checkout <branch>"
    echo "   or: multimodule status"
    echo "   or: multimodule push <repository url> <local ref> <remote ref>"
    echo "   or: multimodule pull <repository url> <remote ref> <local ref>"
    exit 1
}

# This loop parses the command line arguments to find the
# subcommand name to dispatch.  Parsing of the subcommand specific
# options are primarily done by the subcommand implementations.
# Subcommand specific options such as --branch and --cached are
# parsed here as well, for backward compatibility.

while test $# != 0 && test -z "$command"
do
	case "$1" in
	clone | branch | tag | checkout | status | push | pull )
		command=$1
		;;
	-q|--quiet)
		GIT_QUIET=1
		;;
	-b|--branch)
		case "$2" in
		'')
			usage
			;;
		esac
		branch="$2"; shift
		;;
	--cached)
		cached="$1"
		;;
	--)
		break
		;;
	-*)
		usage
		;;
	*)
		break
		;;
	esac
	shift
done

# No command word defaults to "status"
test -n "$command" || command=status

# "-b branch" is accepted only by "add"
if test -n "$branch" && test "$command" != branch
then
	usage
fi

# "--cached" is accepted only by "status" and "summary"
if test -n "$cached" && test "$command" != status -a "$command" != summary
then
	usage
fi

"cmd_$command" "$@"
