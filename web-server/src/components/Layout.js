import React, { Component } from "react"
import SideBar from "./SideBar"
import MainMessageArea from "./MainMessageArea"
import { withRouter, Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux"
import { setMyInfo, setActiveUsers } from "../redux/actions"
import socket from "../socketClient"

class Layout extends Component {
	constructor(props) {
		super(props)
		this.state = {
			page: { width: 800, height: 800 }
		}
	}

	componentDidMount() {
		socket.doConnect(this.props.displayName)

		window.onresize = (e) => {
            this.responsiveHandler(e.target)
		}
		this.responsiveHandler(window)

		this.handleSocketClient()
	}

	componentWillUnmount() {
		socket.doDisconnect()
	}

	handleSocketClient() {
		// socket.onConnect((socketId) => {
		// 	console.log(socketId)
		// })
		socket.on("user-list-updated", d => {
			// console.log("user-list-updated ", d)
			const userList = this.props.myInfo ? d.userList.filter(v => v.socketId!==this.props.myInfo.socketId) : d.userList
			this.props.setActiveUsers(userList)
		})
		socket.on("welcome-my-info", d => {
			this.props.setMyInfo(d.myInfo)
		})
	}

	responsiveHandler = (window) => {
		this.setState({ page: { width: window.innerWidth, height: window.innerHeight } })
	}

	render() {
		const widthPercent = this.state.page.width>=3840 ? "40%" 
			: this.state.page.width>= 2160 ? "60%" 
			: this.state.page.width>= 1920 ? "75%" 
			: this.state.page.width>= 1366 ? "85%"
			: this.state.page.width>= 1125 ? "95%" 
			: "100%"

		if(!socket) return "Connecting.."
		return (
			<div className="bg-secondary d-flex justify-content-center" style={{ height: "100vh", padding: 0 }}>
				<div className="d-flex border shadow" style={{ height: "100%", width: widthPercent, }}>
					{/* <SideBar className="bg-light" style={{ minWidth: 320, borderRight: '1px solid lightgray' }} page={this.state.page} /> */}
					<Switch>
						<Route path={`/:userId`}>
							<>
								<SideBar className="bg-light" style={{ minWidth: 280, borderRight: '1px solid lightgray' }} page={this.state.page} />
								<MainMessageArea className="bg-white flex-fill" page={this.state.page} />
							</>
						</Route>
						<Route path={`/`}>
							<>
								<SideBar className="bg-light" style={{ minWidth: 320, borderRight: '1px solid lightgray' }} page={this.state.page} />
								<EmptyUserArea />
							</>							
						</Route>
						<Redirect to="/" />
					</Switch>
				</div>
			</div>
		);
	}

}

const EmptyUserArea = () => {
	return (
		<div className="flex-fill d-flex align-items-center justify-content-center bg-white">
			<div className="">
				<div className="h4 text-secondary text-center">Send your Titi Tata to your friends</div>
				<div className="h5 text-secondary text-center">Select the user from the left menu to start messaging!</div>
			</div>
		</div>
	)
}

export default withRouter(connect( 
		state => ({ 
			activeUsers: state.userReducer.activeUsers,
			myInfo: state.userReducer.myInfo
		}), 
		{ setMyInfo, setActiveUsers }
	)
	(Layout));