import { v4 as uuidv4 } from "uuid"

export default class Dashboard {
	constructor(parrentSelector) {
		this.parrentDomElement = document.querySelector(parrentSelector)
		this.dataTasks = JSON.parse(localStorage.getItem("tasks")) || { todo: [], inProgress: [], done: [] }

		this.moveGhostTask = this.moveGhostTask.bind(this)

		this.reverseTasks = this.reverseTasks.bind(this)
	}

	init() {
		this.dasboardDomEl = document.createElement("ul")
		this.dasboardDomEl.classList.add("task-cols")

		this.dasboardDomEl.innerHTML = `
            <li class="task-cols__item" data-col="todo">
                <h2 class="task-cols__item-title" >TODO</h2>
                <ul class="tasks-list"></ul>
                <button class="task-cols__item-add">Add another card</button>

                <form class="add-form">
                    <textarea class="add-form__textarea" placeholder="Enter a text for this card" required="required"></textarea>
                    <div class="add-form__buttons">
                        <button class="add-form__added" type="submit">Add Card</button>
                        <button class="add-form__close close-btn"></button>
                    </div>
                </form>
            </li>
            <li class="task-cols__item" data-col="inProgress">
                <h2 class="task-cols__item-title">in progress</h2>
                <ul class="tasks-list"></ul>
                <button class="task-cols__item-add">Add another card</button>

                <form class="add-form">
                    <textarea class="add-form__textarea" placeholder="Enter a text for this card" required="required"></textarea>
                    <div class="add-form__buttons">
                        <button class="add-form__added" type="submit">Add Card</button>
                        <button class="add-form__close close-btn"></button>
                    </div>
                </form>
            </li>
            <li class="task-cols__item" data-col="done">
                <h2 class="task-cols__item-title">done</h2>
                <ul class="tasks-list"></ul>
                <button class="task-cols__item-add">Add another card</button>

                <form class="add-form" name="add-form">
                    <textarea class="add-form__textarea" placeholder="Enter a text for this card" required></textarea>
                    <div class="add-form__buttons">
                        <button class="add-form__added" type="submit">Add Card</button>
                        <button class="add-form__close close-btn"></button>
                    </div>
                </form>
            </li>
        `

		this.parrentDomElement.appendChild(this.dasboardDomEl)

		for (const key in this.dataTasks) {
			if (Object.prototype.hasOwnProperty.call(this.dataTasks, key)) {
				this.renderTaskList({ tasks: this.dataTasks[key], name: key })
			}
		}
	}

	addEvents() {
		this.dasboardDomEl.querySelectorAll(".task-cols__item-add").forEach(btnAdd => {
			btnAdd.addEventListener("click", e => {
				e.preventDefault()
				this.showAddForm(e.target.closest(".task-cols__item-add"))
			})
		})

		this.dasboardDomEl.querySelectorAll(".add-form__close").forEach(btnFormClose => {
			btnFormClose.addEventListener("click", e => {
				e.preventDefault()
				this.hiddenAddForm(e.target.closest(".add-form__close"))
			})
		})

		this.dasboardDomEl.querySelectorAll(".add-form__added").forEach(btnFormAdd => {
			btnFormAdd.addEventListener("click", e => {
				e.preventDefault()
				const currentCol = e.target.closest(".add-form__added").closest(".task-cols__item")
				const currentTextArea = currentCol.querySelector(".add-form__textarea")

				if (currentTextArea.value !== "") {
					this.addTask(currentCol, currentTextArea)

					this.hiddenAddForm(e.target.closest(".add-form__added"))
				}
			})
		})

		this.dasboardDomEl.querySelectorAll(".tasks-list").forEach(list => {
			list.addEventListener("click", e => {
				e.preventDefault()
				if (e.target.closest(".tasks-list__item-close")) {
					this.removeTask(e.target.closest(".tasks-list__item"))
				}
			})
		})

		this.dasboardDomEl.addEventListener("mousedown", e => {
			if (e.target.closest(".close-btn")) return

			const currentTask = e.target.closest(".tasks-list__item")

			if (currentTask) {
				const { ghostTask, diffX, diffY } = this.createGhostTask(currentTask, e.pageX, e.pageY)

				const currentCol = e.target.closest(".task-cols__item")

				this.moveTaskInformation = { currentCol, currentTask, ghostTask, diffX, diffY }

				this.moveGhostTask(e)

				document.body.addEventListener("mousemove", this.moveGhostTask)

				document.body.addEventListener("mouseleave", this.reverseTasks)

				document.body.addEventListener("mouseup", this.reverseTasks)
			}
		})
	}

	renderTaskList(col) {
		const goalCol = this.dasboardDomEl.querySelector(`[data-col = "${col.name}"]`)
		const goalColList = goalCol.querySelector(".tasks-list")

		goalColList.innerHTML = ""

		col.tasks.forEach(({ text, id }) => {
			const task = document.createElement("li")
			task.classList.add("tasks-list__item")
			task.dataset.id = id

			task.innerHTML = `
                    <p class="tasks-list__item-text">${text}</p>
                    <button class="tasks-list__item-close close-btn"></button>
                `

			goalColList.appendChild(task)
		})
	}

	addTask(currentCol, currentTextArea) {
		this.dataTasks[currentCol.dataset.col].push({ text: currentTextArea.value, id: uuidv4() })

		this.tasksSave()

		this.renderTaskList({ tasks: this.dataTasks[currentCol.dataset.col], name: currentCol.dataset.col })
	}

	removeTask(taskForRemove) {
		const { id } = taskForRemove.dataset
		const colName = taskForRemove.closest(".task-cols__item").dataset.col

		this.dataTasks[colName] = this.dataTasks[colName].filter(task => task.id !== id)

		this.tasksSave()

		this.renderTaskList({ tasks: this.dataTasks[colName], name: colName })
	}

	tasksSave() {
		localStorage.setItem("tasks", JSON.stringify(this.dataTasks))
	}

	createGhostTask(taskForMove, mouseX, mouseY) {
		const ghostTask = taskForMove.cloneNode(true)

		ghostTask.classList.add("dnd-task")

		document.body.appendChild(ghostTask)

		const { x, y, width } = taskForMove.getBoundingClientRect()
		const diffX = mouseX - x
		const diffY = mouseY - y

		ghostTask.style.width = `${width}px`

		document.body.style.cursor = "grabbing"

		return { ghostTask, diffX, diffY }
	}

	moveGhostTask(e) {
		e.preventDefault()

		const { ghostTask, diffX, diffY, currentTask } = this.moveTaskInformation

		currentTask.style.display = "none"

		const goalList = e.target.closest(".tasks-list")
		const goalTask = e.target.closest(".tasks-list__item")

		if (goalTask) {
			const { y, height } = goalTask.getBoundingClientRect()

			if (e.pageY < y + height / 2) {
				this.topHalf = true
			} else {
				this.topHalf = false
			}

			this.renderFantomTask(goalList, goalTask)
		}

		if (!goalList) {
			this.removeFantomTask()
		}

		ghostTask.style.left = `${e.pageX - diffX}px`
		ghostTask.style.top = `${e.pageY - diffY}px`
	}

	renderFantomTask(goalList, goalTask) {
		if (this.topHalf && goalTask.previusElementSibling !== this.fantomTask) {
			this.removeFantomTask()
			this.createFantomTask(goalList, goalTask)

			return
		}

		if (!this.topHalf && goalTask.nextElementSibling !== this.fantomTask) {
			this.removeFantomTask()

			const nextGoalTask = goalTask.nextElementSibling

			if (nextGoalTask) {
				this.createFantomTask(goalList, nextGoalTask)
				return
			}

			this.createFantomTask(goalList)
		}
	}

	createFantomTask(goalList, goalTask) {
		this.fantomTask = document.createElement("li")
		this.fantomTask.classList.add("fantom-task")

		if (!goalTask) {
			goalList.appendChild(this.fantomTask)
			return
		}

		goalList.insertBefore(this.fantomTask, goalTask)
	}

	removeFantomTask() {
		if (this.fantomTask) {
			this.fantomTask.remove()
		}
	}

	reverseTasks(e) {
		e.preventDefault()

		document.body.removeEventListener("mousemove", this.moveGhostTask)
		document.body.removeEventListener("mouseup", this.reverseTasks)
		document.body.removeEventListener("mouseleave", this.reverseTasks)

		document.body.style.cursor = "auto"

		const goalCol = e.target.closest(".task-cols__item")
		const goalTask = this.fantomTask
		const nextGoalTask = this.fantomTask.nextElementSibling

		if (!goalCol) {
			this.moveTaskInformation.ghostTask.remove()

			this.renderTaskList({
				tasks: this.dataTasks[this.moveTaskInformation.currentCol.dataset.col],
				name: this.moveTaskInformation.currentCol.dataset.col
			})

			this.moveTaskInformation = {}
			return
		}

		const goalCoName = goalCol.dataset.col

		this.removeTask(this.moveTaskInformation.currentTask)

		if (goalTask) {
			if (nextGoalTask) {
				const goalTaskIndex = this.dataTasks[goalCoName].findIndex(task => task.id === nextGoalTask.dataset.id)

				this.dataTasks[goalCoName].splice(goalTaskIndex, 0, {
					text: this.moveTaskInformation.ghostTask.querySelector(".tasks-list__item-text").textContent,
					id: this.moveTaskInformation.ghostTask.dataset.id
				})
			} else {
				this.dataTasks[goalCoName].push({
					text: this.moveTaskInformation.ghostTask.querySelector(".tasks-list__item-text").textContent,
					id: this.moveTaskInformation.ghostTask.dataset.id
				})
			}
		} else {
			this.dataTasks[goalCoName].push({
				text: this.moveTaskInformation.ghostTask.querySelector(".tasks-list__item-text").textContent,
				id: this.moveTaskInformation.ghostTask.dataset.id
			})
		}

		this.tasksSave()

		this.renderTaskList({ tasks: this.dataTasks[goalCoName], name: goalCoName })

		this.moveTaskInformation.ghostTask.remove()
		this.moveTaskInformation = {}
	}

	showAddForm(targetBtn) {
		targetBtn.closest(".task-cols__item").querySelector(".add-form").classList.add("added-process")
		targetBtn.classList.add("added-process")
	}

	hiddenAddForm(targetBtn) {
		const currentCol = targetBtn.closest(".task-cols__item")
		const currentForm = currentCol.querySelector(".add-form")
		const currentTextArea = currentForm.querySelector(".add-form__textarea")

		currentForm.classList.remove("added-process")

		currentTextArea.value = ""
		currentTextArea.textContent = ""

		currentCol.querySelector(".task-cols__item-add").classList.remove("added-process")
	}
}
